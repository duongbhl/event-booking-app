import QRCode from 'qrcode';
import * as  crypto from 'crypto';

/**
 * Generate raw QR data (text format) for a ticket
 * Returns: ticketId|eventId|uniqueToken
 */
export const generateQRData = (
    ticketId: string,
    eventId: string
): string => {
    try {
        // Create a unique token combining ticket and event info
        const uniqueToken = crypto
            .createHash('sha256')
            .update(`${ticketId}${eventId}${Date.now()}`)
            .digest('hex')
            .substring(0, 16);

        // Format: ticketId|eventId|uniqueToken (ONLY 60 chars approx)
        const qrData = `${ticketId}|${eventId}|${uniqueToken}`;
        
        console.log('[generateQRData] Generated QR text data:', qrData);
        console.log('[generateQRData] QR text length:', qrData.length);

        return qrData;
    } catch (error) {
        console.error('Error generating QR data:', error);
        throw new Error('Failed to generate QR data');
    }
};

/**
 * Generate QR code image (PNG data URL) from raw text data
 * Used for displaying QR code in UI (e.g., ticket view)
 */
export const generateQRCodeImage = async (qrData: string): Promise<string> => {
    try {
        console.log('[generateQRCodeImage] Creating image for data:', qrData);
        
        // Generate QR code image as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1,
        });

        console.log('[generateQRCodeImage] QR image generated (length:', qrCodeDataUrl.length, ')');
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code image:', error);
        throw new Error('Failed to generate QR code image');
    }
};

/**
 * Legacy function - kept for compatibility
 */
export const generateTicketQRCode = async (
    ticketId: string,
    eventId: string
): Promise<string> => {
    try {
        // Generate only the raw text data, NOT the image
        // The image will be generated separately if needed
        const qrData = generateQRData(ticketId, eventId);
        return qrData; // Return raw data, not image
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Parse QR code data to extract ticket info
 */
export const parseQRCodeData = (qrData: string): {
    ticketId: string;
    eventId: string;
    token: string;
} | null => {
    try {
        // Trim whitespace and handle potential newlines
        const cleanedData = qrData.trim();
        
        console.log('[parseQRCodeData] Raw input:', JSON.stringify(qrData));
        console.log('[parseQRCodeData] Cleaned input:', JSON.stringify(cleanedData));
        
        const parts = cleanedData.split('|');
        
        console.log('[parseQRCodeData] Parts count:', parts.length);
        console.log('[parseQRCodeData] Parts:', parts);
        
        if (parts.length !== 3) {
            console.warn('[parseQRCodeData] Invalid format - expected 3 parts, got:', parts.length);
            return null;
        }

        const result = {
            ticketId: parts[0].trim(),
            eventId: parts[1].trim(),
            token: parts[2].trim(),
        };
        
        console.log('[parseQRCodeData] Parsed successfully:', result);
        
        return result;
    } catch (error) {
        console.error('Error parsing QR code:', error);
        return null;
    }
};
