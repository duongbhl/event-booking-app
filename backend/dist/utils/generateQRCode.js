"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQRCodeData = exports.generateTicketQRCode = exports.generateQRCodeImage = exports.generateQRData = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const crypto = __importStar(require("crypto"));
/**
 * Generate raw QR data (text format) for a ticket
 * Returns: ticketId|eventId|uniqueToken
 */
const generateQRData = (ticketId, eventId) => {
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
    }
    catch (error) {
        console.error('Error generating QR data:', error);
        throw new Error('Failed to generate QR data');
    }
};
exports.generateQRData = generateQRData;
/**
 * Generate QR code image (PNG data URL) from raw text data
 * Used for displaying QR code in UI (e.g., ticket view)
 */
const generateQRCodeImage = async (qrData) => {
    try {
        console.log('[generateQRCodeImage] Creating image for data:', qrData);
        // Generate QR code image as data URL
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1,
        });
        console.log('[generateQRCodeImage] QR image generated (length:', qrCodeDataUrl.length, ')');
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error('Error generating QR code image:', error);
        throw new Error('Failed to generate QR code image');
    }
};
exports.generateQRCodeImage = generateQRCodeImage;
/**
 * Legacy function - kept for compatibility
 */
const generateTicketQRCode = async (ticketId, eventId) => {
    try {
        // Generate only the raw text data, NOT the image
        // The image will be generated separately if needed
        const qrData = (0, exports.generateQRData)(ticketId, eventId);
        return qrData; // Return raw data, not image
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};
exports.generateTicketQRCode = generateTicketQRCode;
/**
 * Parse QR code data to extract ticket info
 */
const parseQRCodeData = (qrData) => {
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
    }
    catch (error) {
        console.error('Error parsing QR code:', error);
        return null;
    }
};
exports.parseQRCodeData = parseQRCodeData;
