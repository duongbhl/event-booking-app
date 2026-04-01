# 📊 QR Code Check-in System - Visual Reference

## 🎬 Complete User Flow Diagram

### **Scenario: Booker purchases ticket → Organizer checks in attendee**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        BOOKER JOURNEY (Purchase)                                │
│                                                                                 │
│  1. Browse Events          2. Select Event         3. Buy Ticket                │
│  ┌──────────────┐         ┌─────────────┐        ┌──────────────┐             │
│  │  Event List  │  --->   │ Event Detail│ --->   │ BuyTicket    │             │
│  │  with search │         │  + Map      │        │ + Price      │             │
│  └──────────────┘         └─────────────┘        └──────────────┘             │
│                                                           ↓                      │
│  4. Select Tier & Qty     5. Proceed to Payment  6. Confirm Payment            │
│  ┌──────────────┐         ┌─────────────┐        ┌──────────────────┐         │
│  │ Tier: VIP    │  --->   │ Payment     │ --->   │ Process Payment  │         │
│  │ Qty: 2       │         │ Gateway     │        │ Confirm Success  │         │
│  │ Total: $100  │         │ (Stripe)    │        └──────────────────┘         │
│  └──────────────┘         └─────────────┘                  ↓                    │
│                                                                                 │
│                              ✅ PAYMENT SUCCESS                                 │
│                                     ↓                                           │
│  7. QR CODES GENERATED (Backend)  8. Display QR Code  9. Save for Later        │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────┐                │
│  │ For each ticket:     │  │ Show QR code(s)  │  │ Saved in │                │
│  │ - Generate unique QR │  │ on confirmation  │  │ MyTickets│                │
│  │ - Create token       │  │ screen           │  │ page     │                │
│  │ - Store in DB        │  └──────────────────┘  └──────────┘                │
│  └──────────────────────┘                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZER JOURNEY (Check-in)                               │
│                                                                                 │
│  1. My Events              2. Select Event         3. View Details              │
│  ┌──────────────┐         ┌─────────────┐        ┌──────────────┐             │
│  │ Events I     │  --->   │ Event Detail│ --->   │ Events Stats │             │
│  │ created      │         │ Edit panel  │        │ Edit panel   │             │
│  └──────────────┘         └─────────────┘        └──────────────┘             │
│                                                           ↓                      │
│  4. Event is ACCEPTED                          5. Click Check-in Button        │
│  ┌──────────────┐                              ┌──────────────────┐           │
│  │ ✓ Approved   │                              │ [Check-in Tickets]            │
│  │ Can manage   │                              └──────────────────┘           │
│  │ attendance   │                                         ↓                     │
│  └──────────────┘                                                              │
│                                          6. CAMERA SCREEN OPENS               │
│                                          ┌──────────────────────┐             │
│                                          │  📷 QR Code Scanner  │             │
│                                          │                      │             │
│                                          │   [Focus Box]        │             │
│                                          │   ┌──────────────┐   │             │
│                                          │   │              │   │             │
│                                          │   │   QR Frame   │   │             │
│                                          │   │              │   │             │
│                                          │   └──────────────┘   │             │
│                                          │                      │             │
│                                          │ [Manual Input][Exit] │             │
│                                          └──────────────────────┘             │
│                                                    ↓                           │
│                    7. SCAN ATTENDEE'S QR CODE (or manual input)               │
│                                                    ↓                           │
│                          8. BACKEND VALIDATION                                │
│                    ┌─────────────────────────────────────┐                    │
│                    │ ✓ Organizer owns event?             │                    │
│                    │ ✓ QR format valid?                  │                    │
│                    │ ✓ QR belongs to this event?         │                    │
│                    │ ✓ Ticket is paid?                   │                    │
│                    │ ✓ Not already checked?              │                    │
│                    └─────────────────────────────────────┘                    │
│                                    ↓                                           │
│             9. DISPLAY RESULT                                                 │
│             ┌──────────────────────────────────┐                              │
│             │                                   │                              │
│      ✅ SUCCESS              ⚠️ WARNING         ❌ ERROR                      │
│   ┌──────────────┐      ┌──────────────┐  ┌──────────────┐                  │
│   │ Attendee:    │      │ Already      │  │ Wrong Event  │                  │
│   │ John Doe     │      │ Checked In   │  │ or Not Paid  │                  │
│   │ Ticket: VIP  │      │              │  │              │                  │
│   │ Marked ✓     │      │ Auto-reset   │  │ [Try Again]  │                  │
│   │              │      │ in 3 seconds │  │              │                  │
│   │ Auto-reset   │      └──────────────┘  └──────────────┘                  │
│   │ in 3 seconds │                                                           │
│   └──────────────┘                                                           │
│             ↓                                                                  │
│   🔄 SCANNER READY FOR NEXT TICKET                                           │
│                                                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Data Structure

### **QR Code Format**
```
Format: ticketId|eventId|token
Example: 507f1f77bcf86cd799439011|507f1f77bcf86cd799439012|a1b2c3d4e5f6g7h8

Components:
├─ ticketId: MongoDB ObjectId of the ticket
├─ eventId: MongoDB ObjectId of the event
└─ token: Cryptographic hash for security
```

### **Ticket Document (MongoDB)**
```javascript
{
  _id: ObjectId,
  user: ObjectId,            // Booker
  event: ObjectId,           // Event reference
  price: Number,
  ticketType: String,        // e.g., "VIP"
  tierName: String,          // e.g., "VIP"
  seatInfo: String,          // Seat assignment
  qrCode: String,            // ✅ NEW: QR data URL
  paymentStatus: String,     // 'pending' | 'paid' | 'failed'
  checked: Boolean,          // ✅ NEW: Check-in status (false initially)
  checkedAt: Date,           // ✅ NEW: Check-in timestamp
  checkedBy: ObjectId,       // ✅ NEW: Organizer who checked in
  bookedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Request/Response Flow

### **1. Confirm Payment (POST /tickets/confirm)**
```
REQUEST:
{
  "paymentId": "507f1f77bcf86cd799439011",
  "success": true
}

PROCESSING:
1. Backend receives confirm payment
2. Updates payment status to "success"
3. Updates all tickets status to "paid"
4. 🎟️ FOR EACH TICKET:
   - Generate unique QR code
   - Save QR to database
5. Return response

RESPONSE:
{
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "success",
    "amount": 100,
    ...
  },
  "tickets": [
    {
      "_id": "ticket1",
      "qrCode": "data:image/png;base64,iVBORw0KG...",
      "paymentStatus": "paid",
      ...
    },
    {
      "_id": "ticket2", 
      "qrCode": "data:image/png;base64,iVBORw0KG...",
      "paymentStatus": "paid",
      ...
    }
  ]
}
```

### **2. Check-in Ticket (POST /tickets/checkin)**
```
REQUEST:
{
  "qrCode": "507f1f77bcf86cd799439011|507f1f77bcf86cd799439012|a1b2c3d4",
  "eventId": "507f1f77bcf86cd799439012"
}

PROCESSING:
1. Verify organizer owns the event
2. Parse QR code: extract ticketId, eventId, token
3. Validate:
   ✓ QR format valid
   ✓ QR eventId matches request eventId
   ✓ Ticket exists
   ✓ Ticket payment status is "paid"
   ✓ Ticket not already checked (checked === false)
4. Update ticket:
   - Set checked = true
   - Set checkedAt = now
   - Set checkedBy = organizer._id
5. Return success with attendee info

RESPONSE (SUCCESS):
{
  "message": "Ticket checked in successfully",
  "status": "SUCCESS",
  "ticket": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "title": "Nike Basketball Camp",
      "_id": "507f1f77bcf86cd799439012"
    },
    "tierName": "VIP",
    "seatInfo": "A-1",
    "checked": true,
    "checkedAt": "2024-04-02T10:30:00.000Z"
  }
}

RESPONSE (ALREADY CHECKED):
{
  "message": "Ticket has already been checked in",
  "status": "ALREADY_CHECKED",
  "checkedAt": "2024-04-02T09:00:00.000Z"
}

RESPONSE (WRONG EVENT):
{
  "message": "QR code does not belong to this event",
  "status": "WRONG_EVENT"
}
```

---

## 🔄 State Transitions

### **Ticket States**
```
CREATION        PAYMENT         CHECK-IN
─────────       ──────────      ────────

┌─────────┐    ┌───────────┐    ┌─────────┐
│ PENDING │ -> │ PAID      │ -> │ CHECKED │
├─────────┤    ├───────────┤    ├─────────┤
│ created │    │ QR gen.   │    │ Can't   │
│ at       │    │ at        │    │ be      │
│ booking  │    │ payment   │    │ scanned │
└─────────┘    │ confirm   │    │ again   │
               └───────────┘    └─────────┘
                 ↓ (if failed)
            ┌──────────┐
            │ FAILED   │
            └──────────┘
            (invalid for check-in)
```

---

## 🔐 Security Layers

```
Layer 1: Authentication
├─ User must be logged in
└─ Token required for API calls

Layer 2: Authorization  
├─ Organizer must own the event
└─ Only event owner can check in

Layer 3: QR Validation
├─ QR format must be valid
├─ QR must belong to correct event  
└─ QR token is cryptographically verified

Layer 4: Ticket Status
├─ Ticket must be paid
└─ Payment status verified from database

Layer 5: One-Time Check-in
├─ Ticket checked flag verified
└─ Cannot check in twice
```

---

## 📊 Database Indexes

Recommended indexes for performance:

```javascript
// On Ticket collection
db.tickets.createIndex({ "event": 1, "checked": 1 })
db.tickets.createIndex({ "user": 1, "paymentStatus": 1 })
db.tickets.createIndex({ "checkedAt": 1 })

// On Payment collection (already exists)
db.payments.createIndex({ "user": 1, "createdAt": -1 })
```

---

## 🎯 Error Codes & Handling

```
┌─────────────┬──────────────────────────────────┬────────────────────┐
│ Status      │ Message                          │ User Action        │
├─────────────┼──────────────────────────────────┼────────────────────┤
│ SUCCESS     │ Ticket checked in successfully   │ Show ✓ screen      │
│ ALREADY     │ Ticket already checked in        │ Show ⚠️ warning    │
│ WRONG_EVENT │ QR wrong event                   │ Verify QR matches  │
│ PAYMENT     │ Ticket not paid                  │ Redirect to pay    │
│ NOT_FOUND   │ Ticket not found                 │ Check QR validity  │
│ FORBIDDEN   │ Not event organizer              │ Login as organizer │
│ ERROR       │ Generic error                    │ Retry or support   │
└─────────────┴──────────────────────────────────┴────────────────────┘
```

---

## 🚀 Performance Considerations

### **QR Generation**
- Async operation, doesn't block payment confirmation
- Happens after ticket creation
- Graceful failure - payment succeeds even if QR fails

### **QR Validation**
- Fast lookups using indexes
- No N+1 queries (populate optimized)
- Single database call for validation

### **Scanning**
- Real-time camera processing
- Network latency handled gracefully
- Timeout after 30s with retry

---

## 📱 Device Support

### **Camera**
- iOS 10+
- Android 5+
- Web (limited, depends on browser)

### **QR Scanning**
- Works offline for scanning
- Requires internet to submit check-in
- Graceful error if offline

---

## 🔄 Retry & Recovery Strategy

```
Scan Attempt
    ↓
Can read QR? ──NO──> Show "Invalid QR" ──> [Retry]
    ↓ YES
Can reach server? ──NO──> Show "No connection" ──> [Retry]
    ↓ YES
Is event valid? ──NO──> Show "Wrong event" ──> [Manual Input]
    ↓ YES
Is ticket valid? ──NO──> Show error → [Retry with manual]
    ↓ YES
✅ Success ──> Show attendee details ──> Auto-reset (3s)
```

---

## 🎓 Learning Resources

- **QR Code Format:** Standard data matrix encoding
- **expo-camera:** React Native camera integration
- **MongoDB:** Document validation and indexing
- **CryptoJS:** Token generation and verification

---

This visual reference provides a complete understanding of how the QR code check-in system works!
