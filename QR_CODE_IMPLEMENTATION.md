# QR Code Ticket Check-in Implementation Guide

## Overview
This implementation provides a complete QR code generation and validation system for event ticket bookings. When a booker successfully purchases tickets, unique QR codes are generated and stored. When an organizer scans a QR code, the system validates it and marks the ticket as checked in.

---

## Features Implemented

### 1. **QR Code Generation on Payment Success**
- When payment is confirmed, unique QR codes are generated for each ticket
- QR codes contain: `ticketId|eventId|uniqueToken`
- QR codes are stored in the ticket document

### 2. **Check-in Validation**
- Organizers can scan QR codes to check in attendees
- System validates:
  - QR code format is valid
  - QR code belongs to the correct event
  - Ticket payment status is "paid"
  - Ticket has not been checked in already
- Returns detailed error messages for validation failures

### 3. **Check-in UI**
- Real-time QR code scanner using device camera
- Manual input option for testing
- Visual feedback for success/error states
- Displays attendee information upon successful check-in

---

## Backend Implementation

### 1. **Ticket Model Updates** (`backend/src/models/ticket.model.ts`)
```typescript
// Added fields:
checked: boolean;          // Whether ticket has been checked in
checkedAt?: Date;         // When it was checked in
checkedBy?: ObjectId;     // Which organizer checked it in
qrCode?: string;          // QR code data URL
```

### 2. **QR Code Utility** (`backend/src/utils/generateQRCode.ts`)
- `generateTicketQRCode()`: Generates QR code containing ticket and event info
- `parseQRCodeData()`: Parses QR code data back into components
- Uses `qrcode` npm package

### 3. **Payment Controller Update** (`backend/src/controllers/ticket.controller.ts`)
```typescript
// In confirmPayment() function:
if (success) {
  // ... existing code ...
  
  // 🎟️ Generate QR codes for all tickets
  for (const ticket of tickets) {
    const qrCode = await generateTicketQRCode(
      String(ticket._id),
      String(payment.event)
    );
    await Ticket.findByIdAndUpdate(ticket._id, { qrCode });
  }
}
```

### 4. **Check-in Controller** (`backend/src/controllers/ticket.controller.ts`)
New endpoint: `checkInTicket()`
- Validates organizer ownership of event
- Parses and validates QR code
- Checks ticket payment status
- Prevents duplicate check-ins
- Records check-in timestamp and organizer ID

### 5. **Routes** (`backend/src/routes/ticket.routes.ts`)
```typescript
ticketRoutes.post('/checkin', protect, checkInTicket);
```

---

## Frontend Implementation

### 1. **Check-in Service** (`frontend/services/ticket.service.ts`)
```typescript
export const checkInTicket = async (
  data: { qrCode: string; eventId: string },
  token: string
) => {
  const res = await api.post("/tickets/checkin", data, authHeader(token));
  return res.data;
};
```

### 2. **Check-in Screen** (`frontend/pages/MyEvent/CheckIn.tsx`)
- Real-time QR code scanning using `expo-camera`
- Camera permission handling
- Manual QR code input for testing
- Result display with:
  - ✅ Success: Green card with attendee details
  - ⚠️ Already checked: Yellow warning
  - ❌ Wrong event: Red error
  - ❌ Other errors: Red error with retry button

### 3. **Navigation Integration** (`frontend/navigators/RootNavigator.tsx`)
- Added CheckIn screen to stack navigator
- Accessible to organizers only

### 4. **EventDetails Update** (`frontend/pages/MyEvent/EventDetails.tsx`)
- Added "Check-in Tickets" button for event organizers
- Orange button with QR code icon
- Navigates to CheckIn screen with event details

---

## API Endpoints

### Confirm Payment (Updated)
**POST** `/tickets/confirm`
```json
Request:
{
  "paymentId": "string",
  "success": boolean
}

Response (on success):
{
  "payment": { ... },
  "tickets": [
    {
      "_id": "string",
      "qrCode": "data:image/png;base64,...",
      "checked": false,
      ...
    }
  ]
}
```

### Check-in Ticket (New)
**POST** `/tickets/checkin`
```json
Request:
{
  "qrCode": "ticketId|eventId|token",
  "eventId": "string"
}

Response (success):
{
  "message": "Ticket checked in successfully",
  "status": "SUCCESS",
  "ticket": {
    "_id": "string",
    "user": { "name": "string", "email": "string" },
    "event": { "title": "string" },
    "tierName": "string",
    "seatInfo": "string",
    "checked": true,
    "checkedAt": "2024-04-02T10:30:00Z"
  }
}

Response (already checked):
{
  "message": "Ticket has already been checked in",
  "status": "ALREADY_CHECKED",
  "checkedAt": "2024-04-02T09:00:00Z"
}

Response (wrong event):
{
  "message": "QR code does not belong to this event",
  "status": "WRONG_EVENT"
}
```

---

## Error Handling

| Status | Message | Cause |
|--------|---------|-------|
| `SUCCESS` | Ticket checked in successfully | Valid ticket, first check-in |
| `ALREADY_CHECKED` | Ticket has already been checked in | Duplicate check-in attempt |
| `WRONG_EVENT` | QR code does not belong to this event | QR from different event |
| `PAYMENT_PENDING` | Ticket has not been paid yet | Payment not confirmed |
| `TICKET_NOT_FOUND` | Ticket not found | Invalid ticket ID |
| `ERROR` | Generic error message | Unexpected error |

---

## User Flows

### **Booker Flow (UC3)**
1. Browse events and select event details
2. Click "BUY TICKET"
3. Select ticket tier and quantity
4. Proceed to payment
5. Complete payment
6. Payment confirmed ✅
   - QR codes generated automatically
   - QR codes displayed in ticket details
   - Ticket saved with QR code

### **Organizer Flow (UC4)**
1. Navigate to "My Events"
2. Select event to manage
3. Click "Check-in Tickets" button
4. Camera opens with QR code scanner
5. Scan/input attendee's QR code
6. System validates:
   - Event match
   - Payment confirmation
   - Not already checked in
7. Display result:
   - ✅ Success: Show attendee info, auto-reset scanner
   - ⚠️ Already checked: Show warning, auto-reset scanner
   - ❌ Error: Show error, allow manual retry

---

## Installation & Setup

### Backend
1. **Install QR code library:**
   ```bash
   npm install qrcode
   npm install --save-dev @types/qrcode
   ```

2. **Database Migration** (if needed):
   The schema update is backward compatible. Existing tickets will have:
   - `checked: false` (default)
   - `checkedAt: undefined`
   - `checkedBy: undefined`

### Frontend
1. **Ensure expo-camera is installed:**
   ```bash
   npx expo install expo-camera
   ```

2. **Ensure permissions are set in app.json:**
   ```json
   {
     "permissions": [
       "camera",
       "cameraRoll"
     ]
   }
   ```

---

## Testing

### Manual Testing

**Step 1: Generate Payment & QR Code**
1. As a booker, purchase a ticket
2. Confirm payment
3. QR code is generated and displayed

**Step 2: Check-in**
1. As an organizer, go to event details
2. Click "Check-in Tickets"
3. Allow camera permission
4. Scan QR code from booker's ticket

**Manual QR Input (for testing without camera):**
1. Click "Manual Input" button
2. Copy the QR code format: `{ticketId}|{eventId}|{token}`
3. Paste and submit

---

## Database Schema

### Ticket Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,              // Booker
  event: ObjectId,             // Event reference
  price: Number,
  ticketType: String,
  tierName: String,
  seatInfo: String,
  qrCode: String,              // ✅ NEW: QR code data URL
  paymentStatus: String,       // 'pending' | 'paid' | 'failed'
  checked: Boolean,            // ✅ NEW: Check-in status (default: false)
  checkedAt: Date,             // ✅ NEW: Check-in timestamp
  checkedBy: ObjectId,         // ✅ NEW: Organizer who checked in
  bookedAt: Date,
  timestamps: { createdAt, updatedAt }
}
```

---

## Security Considerations

1. **QR Code Validation:**
   - Only organizers can access check-in endpoint
   - QR codes are cryptographically hashed
   - Event ownership is verified

2. **One-time Check-in:**
   - Tickets can only be checked in once
   - Prevents duplicate entry

3. **Authentication:**
   - All endpoints require user authentication
   - Event organizer verification on check-in

---

## Future Enhancements

1. **Bulk Check-in:** Support checking in multiple tickets at once
2. **Check-in Reports:** Export check-in statistics for events
3. **Ticket Transfer:** Allow bookers to transfer tickets to others
4. **QR Code Customization:** Custom branding on QR codes
5. **Check-in History:** Detailed logs of who checked in when
6. **Real-time Analytics:** Live check-in progress dashboard for organizers

---

## Troubleshooting

### Camera Permission Issues
- Clear app cache and restart
- Check app settings > Permissions > Camera
- Ensure iOS/Android permissions are properly configured

### QR Code Not Scanning
- Ensure good lighting
- Keep QR code within the frame box
- Try manual input mode for testing
- Check QR code is fresh (not rotated/distorted)

### Check-in Fails with "Wrong Event"
- Verify organizer is checking in their own event
- Ensure QR code is from this event's tickets
- QR codes are event-specific and cannot be reused across events

### "Ticket Not Found"
- Verify ticket ID in QR code is valid
- Check database for ticket records
- Ensure payment was confirmed before check-in

---

## Code References

- **Backend Model:** [/backend/src/models/ticket.model.ts](backend/src/models/ticket.model.ts)
- **Backend Utility:** [/backend/src/utils/generateQRCode.ts](backend/src/utils/generateQRCode.ts)
- **Backend Controller:** [/backend/src/controllers/ticket.controller.ts](backend/src/controllers/ticket.controller.ts)
- **Backend Routes:** [/backend/src/routes/ticket.routes.ts](backend/src/routes/ticket.routes.ts)
- **Frontend Service:** [/frontend/services/ticket.service.ts](frontend/services/ticket.service.ts)
- **Frontend Component:** [/frontend/pages/MyEvent/CheckIn.tsx](frontend/pages/MyEvent/CheckIn.tsx)
- **Frontend Navigation:** [/frontend/navigators/RootNavigator.tsx](frontend/navigators/RootNavigator.tsx)
- **EventDetails Update:** [/frontend/pages/MyEvent/EventDetails.tsx](frontend/pages/MyEvent/EventDetails.tsx)

---

## Summary

✅ **Implemented Features:**
- ✅ QR code generation on successful payment
- ✅ QR code validation on check-in
- ✅ Event verification (QR belongs to event)
- ✅ One-time check-in only
- ✅ Real-time scanner with visual feedback
- ✅ Detailed error handling
- ✅ Attendee information display
- ✅ Complete UI/UX flow for both bookers and organizers

This implementation follows the sequence diagrams (UC3 & UC4) and provides a production-ready ticket check-in system.
