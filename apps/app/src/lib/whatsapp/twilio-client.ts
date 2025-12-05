import twilio from 'twilio';

// Validasi environment variables
const validateTwilioEnv = () => {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Twilio environment variables: ${missing.join(', ')}. ` +
      'WhatsApp integration will not work.'
    );
  }
};

// Get Twilio client (singleton)
let twilioClient: twilio.Twilio | null = null;

export const getTwilioClient = () => {
  if (!twilioClient) {
    validateTwilioEnv();
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return twilioClient;
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (
  to: string,
  body: string
): Promise<string> => {
  const client = getTwilioClient();
  
  // Format nomor WhatsApp
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: formattedTo,
    body,
  });

  return message.sid;
};

// Send WhatsApp message with media (untuk kirim gambar/audio)
export const sendWhatsAppMedia = async (
  to: string,
  body: string,
  mediaUrl: string
): Promise<string> => {
  const client = getTwilioClient();
  
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: formattedTo,
    body,
    mediaUrl: [mediaUrl],
  });

  return message.sid;
};

// Validate Twilio webhook signature
export const validateTwilioSignature = (
  signature: string,
  url: string,
  params: Record<string, string>
): boolean => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN tidak ditemukan');
  }

  return twilio.validateRequest(authToken, signature, url, params);
};

// Parse incoming WhatsApp message
export interface IncomingWhatsAppMessage {
  messageSid: string;
  from: string;
  to: string;
  body: string;
  numMedia: number;
  mediaUrls: string[];
  mediaTypes: string[];
}

export const parseIncomingMessage = (
  body: Record<string, string>
): IncomingWhatsAppMessage => {
  const numMedia = parseInt(body.NumMedia || '0', 10);
  const mediaUrls: string[] = [];
  const mediaTypes: string[] = [];

  for (let i = 0; i < numMedia; i++) {
    if (body[`MediaUrl${i}`]) {
      mediaUrls.push(body[`MediaUrl${i}`]);
    }
    if (body[`MediaContentType${i}`]) {
      mediaTypes.push(body[`MediaContentType${i}`]);
    }
  }

  return {
    messageSid: body.MessageSid || '',
    from: body.From || '',
    to: body.To || '',
    body: body.Body || '',
    numMedia,
    mediaUrls,
    mediaTypes,
  };
};
