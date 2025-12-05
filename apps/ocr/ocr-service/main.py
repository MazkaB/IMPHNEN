import os
import io
import numpy as np
from paddleocr import PaddleOCR
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import document templates
from templates import detect_document_type, extract_document_fields

# Environment variables
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize FastAPI
app = FastAPI(title="NUSA AI - OCR Service (PaddleOCR + Gemini)")

# CORS Configuration - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR
print("Initializing PaddleOCR...")
try:
    # PaddleOCR v3.x - minimal parameters
    ocr = PaddleOCR(
        use_textline_orientation=True,
        lang='id'  # Indonesian language
    )
    print("[OK] PaddleOCR initialized successfully (Indonesian language)")
except Exception as e:
    print(f"[ERROR] Failed to initialize PaddleOCR: {e}")
    raise RuntimeError(f"PaddleOCR initialization failed. NO FALLBACK. Error: {e}")

# Initialize Gemini AI
print("Initializing Gemini AI...")
try:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Gemini 2.0 Flash Experimental
    print("[OK] Gemini AI initialized successfully (Gemini 2.0 Flash)")
except Exception as e:
    print(f"[ERROR] Failed to initialize Gemini: {e}")
    raise RuntimeError(f"Gemini initialization failed. NO FALLBACK. Error: {e}")


@app.get("/")
def root():
    return {
        "status": "OK",
        "service": "NUSA AI OCR Service",
        "version": "2.0",
        "ocr_engine": "PaddleOCR",
        "ai_processor": "Gemini AI"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ocr_ready": ocr is not None,
        "gemini_ready": gemini_model is not None,
        "allowed_origin": ALLOWED_ORIGIN
    }


def process_with_gemini(raw_text: str) -> dict:
    """
    Use Gemini AI to intelligently parse receipt text
    Returns structured data with high accuracy
    """
    prompt = f"""Kamu adalah AI expert untuk parsing struk belanja Indonesia. 
Analisa teks OCR berikut dan extract informasi dengan format JSON yang tepat.

TEKS OCR:
{raw_text}

INSTRUKSI:
1. Deteksi nama toko (biasanya di baris pertama/header)
2. Deteksi tanggal transaksi (format Indonesia: DD/MM/YYYY atau DD-MM-YYYY)
3. Extract SEMUA item belanja dengan harga yang benar
4. Hitung total yang akurat (jika tidak ada di struk, hitung dari items)
5. Abaikan teks yang bukan item (seperti "Terima Kasih", "Total", dll)

FORMAT OUTPUT (JSON):
{{
  "storeName": "nama toko",
  "date": "tanggal transaksi",
  "items": [
    {{"name": "nama item", "quantity": 1, "price": harga_angka}}
  ],
  "total": total_akhir
}}

ATURAN PENTING:
- Harga harus ANGKA tanpa "Rp" atau titik/koma
- Jika ada item dengan jumlah >1, multiply harga x quantity
- Total harus sum dari semua items
- Jika tidak yakin, skip item tersebut daripada salah

Berikan OUTPUT HANYA JSON, tanpa markdown atau teks lain."""

    try:
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown if present
        if result_text.startswith('```'):
            lines = result_text.split('\n')
            result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        parsed = json.loads(result_text)
        return parsed
        
    except json.JSONDecodeError as e:
        print(f"[WARNING] Gemini JSON parse error: {e}, using fallback parsing")
        # Fallback to basic parsing
        return {
            "storeName": None,
            "date": None,
            "items": [],
            "total": 0
        }
    except Exception as e:
        print(f"[ERROR] Gemini processing error: {e}")
        raise


@app.post("/ocr/process")
async def process_receipt(
    file: UploadFile = File(...),
   document_type: str = Form(default="auto")  # auto, receipt, invoice, etc.
):
    """
    Process document with PaddleOCR + Gemini AI
    Supports multiple document types with intelligent field extraction
    NO FALLBACK - All errors throw explicitly
    """
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image. NO FALLBACK."
        )
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Perform OCR with PaddleOCR (v3.x uses predict())
        print(f"[PADDLE] Processing image: {file.filename}")
        result = ocr.predict(img_array)
        
        # Debug: Print result structure
        print(f"[DEBUG] Result type: {type(result)}")
        
        if not result or len(result) == 0:
            raise HTTPException(
                status_code=422,
                detail="No text detected in image. Please upload a clearer receipt. NO FALLBACK."
            )
        
        # Extract text from PaddleOCR v3.x nested structure
        ocr_lines = []
        
        # First, check for direct 'rec_texts' key (PaddleOCR v3.x format)
        if isinstance(result, list) and len(result) > 0:
            first_item = result[0]
            if isinstance(first_item, dict) and 'rec_texts' in first_item:
                rec_texts = first_item['rec_texts']
                if isinstance(rec_texts, list):
                    ocr_lines = [str(text) for text in rec_texts if text]
                    print(f"[DEBUG] Found {len(ocr_lines)} texts in 'rec_texts' key")
        
        # If no text found via rec_texts, try deep traversal
        if not ocr_lines:
            def extract_text_from_structure(data, ocr_lines_list):
                """Recursively extract OCR text from nested structure"""
                if isinstance(data, dict):
                    # Check for common OCR text keys
                    for text_key in ['rec_text', 'text', 'transcription', 'content']:
                        if text_key in data and isinstance(data[text_key], str):
                            ocr_lines_list.append(data[text_key])
                    
                    # Look for 'ocr_text_result' or 'text_result' keys
                    for result_key in ['ocr_text_result', 'text_result', 'ocr_result', 'det_res', 'rec_res']:
                        if result_key in data:
                            extract_text_from_structure(data[result_key], ocr_lines_list)
                    
                    # Recursively check all dict values
                    for value in data.values():
                        if isinstance(value, (dict, list)):
                            extract_text_from_structure(value, ocr_lines_list)
                            
                elif isinstance(data, list):
                    for item in data:
                        extract_text_from_structure(item, ocr_lines_list)
            
            # Extract text from result
            extract_text_from_structure(result, ocr_lines)
            print(f"[DEBUG] Extracted {len(ocr_lines)} lines via deep traversal")
        if ocr_lines:
            print(f"[DEBUG] Sample lines: {ocr_lines[:3]}")
        
        if not ocr_lines:
            # Fallback: Print full structure to understand format better
            print(f"[DEBUG] Full result keys (first item): {list(result[0].keys()) if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict) else 'N/A'}")
            raise HTTPException(
                status_code=422,
                detail=f"No OCR text found in result. Please check OCR service logs for structure details. NO FALLBACK."
            )
        
        ocr_text = '\n'.join(ocr_lines)
        print(f"[PADDLE] Extracted {len(ocr_lines)} lines with average quality")
        
        # Auto-detect document type if not specified
        if document_type == "auto":
            print("[GEMINI] Auto-detecting document type...")
            detected_type = detect_document_type(ocr_text, gemini_model)
            document_type = detected_type
            print(f"[GEMINI] Detected document type: {document_type}")
        else:
            print(f"[USER] Using specified document type: {document_type}")
        
        # Extract fields using appropriate template
        print(f"[GEMINI] Extracting fields for {document_type}...")
        parsed_data = extract_document_fields(ocr_text, document_type, gemini_model)
        print(f"[GEMINI] Successfully extracted fields")
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "documentType": document_type,
                "rawText": ocr_text,
                "parsed": parsed_data
            },
            "meta": {
                "ocr_engine": "PaddleOCR",
                "ai_processor": "Gemini 2.0 Flash",
                "lines_detected": len(ocr_lines),
                "auto_detected": document_type != "auto"
            }
        })
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] OCR processing failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}. NO FALLBACK."
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"[STARTING] NUSA AI OCR Service v2.0 on port {port}")
    print(f"[CONFIG] Allowed origin: {ALLOWED_ORIGIN}")
    print(f"[ENGINE] PaddleOCR + Gemini AI")
    uvicorn.run(app, host="0.0.0.0", port=port)
