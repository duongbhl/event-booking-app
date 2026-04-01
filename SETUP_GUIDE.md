# 🎫 QR Code Check-in Setup Guide

## 🚀 Quick Start

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install qrcode
npm install --save-dev @types/qrcode
```

### Step 2: Verify Frontend Dependencies
```bash
cd frontend
# expo-camera should already be installed
# If not, run: npx expo install expo-camera
```

### Step 3: Update app.json (if needed)
Ensure camera permission is in `frontend/app.json`:
```json
{
  "plugins": [
    ["expo-camera", {
      "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
    }]
  ]
}
```

### Step 4: Restart Services
- Restart backend server
- Rebuild frontend app

---

## 📋 Implementation Checklist

### Backend ✅
- [x] Updated Ticket model with check-in fields
- [x] Created QR code generation utility
- [x] Updated confirmPayment to generate QR codes
- [x] Created checkInTicket endpoint
- [x] Added route for check-in endpoint
- [ ] **TODO:** Run `npm install qrcode @types/qrcode`

### Frontend ✅
- [x] Added checkInTicket service method
- [x] Created CheckIn screen component
- [x] Added CheckIn to navigation
- [x] Updated EventDetails with Check-in button
- [ ] **TODO:** Ensure expo-camera permissions are set

---

## 🔄 User Workflows

### For Bookers (Ticket Buyers)
```
1. Browse Events → 2. Select Event → 3. Buy Ticket
   ↓
4. Confirm Payment → 5. QR Code Generated ✅
   ↓
6. View Ticket with QR Code
```

### For Organizers (Event Hosts)
```
1. My Events → 2. Select Event → 3. Click "Check-in Tickets"
   ↓
4. Camera Opens with QR Scanner
   ↓
5. Scan Attendee's QR Code
   ↓
   ✅ Success        ⚠️ Already Checked    ❌ Wrong Event/Error
   ↓                  ↓                       ↓
   Show Details       Show Warning           Show Error
   Auto-reset         Auto-reset             Manual Retry
```

---

## 📱 Features by Role

### Booker
- ✅ Generate QR codes on payment confirmation
- ✅ View QR codes on ticket details
- ✅ Display ticket information with QR

### Organizer
- ✅ Access check-in screen from event details
- ✅ Real-time QR code scanning
- ✅ Manual QR code input (for testing)
- ✅ See attendee details on successful check-in
- ✅ Prevent duplicate check-ins
- ✅ Validate event ownership
- ✅ View error messages with troubleshooting

### System
- ✅ Generate unique QR codes per ticket
- ✅ Validate QR code format and content
- ✅ Track check-in time and organizer
- ✅ Prevent one-time check-in violations
- ✅ Event ownership verification

---

## 🔐 Security Features

1. **QR Code Uniqueness:** Each ticket gets a unique QR code
2. **Event Verification:** QR codes are linked to specific events
3. **One-Time Check-in:** Tickets can only be checked in once
4. **Organizer Verification:** Only event organizers can check in
5. **Payment Validation:** Only paid tickets can be checked in
6. **Cryptographic Hashing:** QR tokens are securely hashed

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Create account as booker
- [ ] Search and select an event
- [ ] Purchase tickets
- [ ] Confirm payment
- [ ] Verify QR codes are generated
- [ ] Create/switch to organizer account
- [ ] Go to event details
- [ ] Click "Check-in Tickets"
- [ ] Grant camera permission
- [ ] Scan QR code (or use manual input)
- [ ] Verify success response with attendee details
- [ ] Try scanning same QR code again (should show "already checked")

### Edge Cases
- [ ] Invalid QR format
- [ ] QR from different event
- [ ] Unpaid ticket
- [ ] Organizer checking in own event
- [ ] Organizer checking in different event's ticket (should fail)
- [ ] Camera permission denied

---

## 📊 Database Impact

### Ticket Collection Changes
```javascript
// New fields added:
{
  checked: Boolean,              // Default: false
  checkedAt: Date,              // Timestampdefault: null
  checkedBy: ObjectId,          // Organizer ID, default: null
  qrCode: String,               // QR data URL, generated on payment confirm
}
```

**Backward Compatibility:** ✅ Existing tickets will have default values

---

## 🎯 API Endpoints Reference

### POST `/tickets/confirm`
**Updated** - Now generates QR codes on success

### POST `/tickets/checkin` (NEW)
**Input:**
```json
{
  "qrCode": "ticketId|eventId|token",
  "eventId": "eventId"
}
```

**Output (Success):**
```json
{
  "message": "Ticket checked in successfully",
  "status": "SUCCESS",
  "ticket": {
    "_id": "...",
    "user": { "name": "...", "email": "..." },
    "event": { "title": "..." },
    "tierName": "...",
    "checked": true,
    "checkedAt": "2024-04-02T10:30:00Z"
  }
}
```

---

## 🐛 Troubleshooting

### QR Code Not Generating
- Check payment was confirmed with `success: true`
- Verify ticket records exist in database
- Check backend logs for QRCode generation errors

### Scanner Not Working
- Verify camera permission granted
- Check phone flashlight and lighting
- Clear app cache: `expo prebuild --clean`

### Check-in Fails
- Verify organizer owns the event
- Verify ticket is paid (`paymentStatus === 'paid'`)
- Verify QR code is from correct event
- Check ticket hasn't been checked in already

### Event Not Found
- Verify eventId is correct
- Check event exists in database
- Verify event hasn't been deleted

---

## 📚 File Reference

| File | Purpose | Status |
|------|---------|--------|
| `backend/src/models/ticket.model.ts` | Ticket schema | ✅ Modified |
| `backend/src/utils/generateQRCode.ts` | QR generation | ✅ Created |
| `backend/src/controllers/ticket.controller.ts` | Business logic | ✅ Updated |
| `backend/src/routes/ticket.routes.ts` | API routes | ✅ Updated |
| `frontend/services/ticket.service.ts` | API service | ✅ Updated |
| `frontend/pages/MyEvent/CheckIn.tsx` | Check-in UI | ✅ Created |
| `frontend/navigators/RootNavigator.tsx` | Navigation | ✅ Updated |
| `frontend/pages/MyEvent/EventDetails.tsx` | Event page | ✅ Updated |

---

## 📞 Support Documentation

See **QR_CODE_IMPLEMENTATION.md** for:
- Detailed architecture explanation
- Complete API documentation
- User flow diagrams
- Error handling details
- Future enhancement ideas
- Security considerations

---

**Status:** ✅ **Implementation Complete & Ready for Testing**

Next steps:
1. Install dependencies: `npm install qrcode @types/qrcode`
2. Verify camera permissions in app.json
3. Run comprehensive testing
4. Deploy to production
