'use server';

import { model, genAI } from '@/lib/gemini';

export async function generateContent(inputType: string, data: string, originalPrice: number | "" = "", discount: number | "" = "") {
    try {
        // 1. Generate Caption (Text)
        let prompt = "";
        if (inputType === "best_seller") {
            prompt = `Buatkan caption Instagram yang menarik dan persuasif untuk produk best seller berikut: "${data}". Gunakan emoji dan hashtag yang relevan.`;
        } else if (inputType === "recommendation") {
            prompt = `Buatkan caption promosi yang mengajak orang untuk mencoba rekomendasi berikut: "${data}". Berikan kesan eksklusif.`;
        } else if (inputType === "expired") {
            // Discount is already embedded in the 'data' string by the UI
            prompt = `Buatkan caption 'Last Chance' atau 'Cuci Gudang' untuk produk berikut: "${data}". 
            PENTING: JANGAN menyebutkan kata 'kadaluarsa', 'expired', 'hampir basi', atau tanggal expired. 
            Fokuskan hanya pada penawaran spesial, diskon besar, dan urgensi (stok terbatas). 
            Buat pembeli merasa beruntung mendapatkan harga murah, bukan membeli barang sisa.`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const caption = response.text();

        // 2. Generate Image (Visual) using Gemini Image

        // Clean product name: Remove " - ..." part AND remove content in parentheses like (Exp: Besok)
        let productName = data.split(" - ")[0];
        productName = productName.replace(/\s*\(.*?\)\s*/g, "").trim();

        const priceStr = originalPrice ? `Rp ${originalPrice.toLocaleString('id-ID')}` : "";
        const discountStr = discount ? `${discount}%` : "";

        // Calculate Final Price
        let finalPriceStr = "";
        if (originalPrice && discount && typeof originalPrice === 'number' && typeof discount === 'number') {
            const finalPrice = originalPrice - (originalPrice * (discount / 100));
            finalPriceStr = `Rp ${finalPrice.toLocaleString('id-ID')}`;
        }

        const baseStyle = "The background color palette and surrounding thematic props are creatively chosen by the AI to look appealing and trendy. Bright even studio lighting, sharp focus, high-end e-commerce aesthetic. --ar 4:5";

        // Dynamic text instruction based on context
        let textInstruction = `Include a premium menu card, label, or elegant text overlay in the composition that CLEARLY displays the text "${productName}" in a readable, stylish font. IMPORTANT: All text visible in the image MUST be in INDONESIAN (Bahasa Indonesia).`;

        if (discount) {
            textInstruction += ` Do NOT use English words like 'Sale' or 'Off'. Use 'Diskon', 'Promo', or 'Hemat' instead.`;
        } else if (inputType === "best_seller") {
            textInstruction += ` Do NOT use English words like 'Best Seller'. Use 'Terlaris' or 'Favorit' instead. Do NOT show 'Diskon' or 'Promo' text since there is no discount.`;
        } else {
            textInstruction += ` Do NOT use English words. Ensure no 'Diskon' or 'Promo' text is shown unless explicitly requested.`;
        }

        let imagePrompt = "";
        if (!discount && !originalPrice) {
            // Case: Name only
            imagePrompt = `A professional flat lay poster photograph from directly above, focusing on ${productName}. ${textInstruction} ${baseStyle}`;
        } else if (!discount) {
            // Case: Name + Price (no discount)
            imagePrompt = `A professional flat lay poster photograph from directly above, focusing on ${productName}. ${textInstruction} A prominent, stylish price tag is placed on or next to the product. The tag clearly shows the price '${priceStr}'. ${baseStyle}`;
        } else if (!originalPrice) {
            // Case: Name + Discount (no original price)
            imagePrompt = `A professional flat lay poster photograph from directly above, focusing on ${productName}. ${textInstruction} A prominent, stylish sale tag or sticker is placed on or next to the product. The tag highlights the discount offer '${discountStr}' in bold text. ${baseStyle}`;
        } else {
            // Case: All Present (Full Template)
            imagePrompt = `A professional flat lay poster photograph from directly above, focusing on ${productName}. ${textInstruction} A prominent, stylish sale tag or sticker is placed on or next to the product. The tag clearly shows the original price '${priceStr}' with a strikethrough (crossed out), highlights the discount '${discountStr}', AND prominently displays the FINAL PRICE '${finalPriceStr}' nearby. ${baseStyle}`;
        }

        console.log("Generated Image Prompt:", imagePrompt);

        // Initialize Image Model
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        let imageUrl = "";
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount < maxRetries) {
            try {
                console.log(`Attempting image generation (Try ${retryCount + 1}/${maxRetries})...`);

                // Generate Image with the constructed prompt
                const imageGenResult = await imageModel.generateContent({
                    contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
                });
                const imageResponse = await imageGenResult.response;

                const candidates = await imageResponse.candidates;
                if (candidates && candidates.length > 0) {
                    const parts = candidates[0].content.parts;

                    // Find the part with inlineData
                    const imagePart = parts.find((p: any) => p.inlineData);

                    if (imagePart && imagePart.inlineData) {
                        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                        break; // Success, exit loop
                    } else {
                        console.log("No inlineData found in any part.");
                        throw new Error("No image data returned by Gemini.");
                    }
                }
            } catch (imgErr) {
                console.error(`Gemini Image Generation Failed (Attempt ${retryCount + 1}):`, imgErr);
                retryCount++;
                if (retryCount === maxRetries) {
                    throw imgErr; // Throw if last attempt failed
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return {
            success: true,
            caption,
            imageUrl: imageUrl,
            unsplashUrl: imageUrl
        };
    } catch (error) {
        console.error("Error generating content:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate content. Please check API Key.",
        };
    }
}
