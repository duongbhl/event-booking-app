import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a QR code for a ticket
 * QR code contains: ticketId|eventId|uniqueToken
 */
export const generateTicketQRCode = async (
    ticketId: string,
    eventId: string
): Promise<string> => {
    try {
        // Create a unique token combining ticket and event info
        const uniqueToken = crypto
            .createHash('sha256')
            .update(`${ticketId}${eventId}${Date.now()}`)
            .digest('hex')
            .substring(0, 16);

        // Format: ticketId|eventId|uniqueToken
        const qrData = `${ticketId}|${eventId}|${uniqueToken}`;

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1,
        });

        return qrCodeDataUrl;
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
        const parts = qrData.split('|');
        if (parts.length !== 3) {
            return null;
        }

        return {
            ticketId: parts[0],
            eventId: parts[1],
            token: parts[2],
        };
    } catch (error) {
        console.error('Error parsing QR code:', error);
        return null;
    }
};
