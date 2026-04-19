# Quick Translation Pattern Reference

Use this document to quickly translate remaining pages following the proven pattern.

## The 3-Step Translation Pattern

Every page translation follows the same 3 steps:

### Step 1: Import the Hook
```tsx
import { useLocalization } from '../context/LocalizationContext';
```

### Step 2: Get Translation Function
```tsx
export default function MyComponent() {
  const { t } = useLocalization();
  // ... rest
}
```

### Step 3: Replace Hardcoded Strings
```tsx
// BEFORE
<Text>My Events</Text>

// AFTER
<Text>{t('home.myEvents')}</Text>
```

---

## Example: Full Translation of EventDetails Page

### Current Code (with hardcoded English):
```tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function EventDetails() {
  const event = { title: 'Concert', date: '2024-01-15', price: '$50' };
  
  return (
    <View>
      <Text>Event Details</Text>
      <Text>Title: {event.title}</Text>
      <Text>Date: {event.date}</Text>
      <Text>Price: {event.price}</Text>
      <Text>Organizer: John Doe</Text>
      <Button title="Buy Tickets" onPress={handleBuy} />
    </View>
  );
}
```

### After Translation:
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';  // ← STEP 1

export default function EventDetails() {
  const { t } = useLocalization();  // ← STEP 2
  const event = { title: 'Concert', date: '2024-01-15', price: '$50' };
  
  return (
    <View>
      <Text>{t('events.eventDetails')}</Text>  {/* ← STEP 3 */}
      <Text>{t('events.title')}: {event.title}</Text>
      <Text>{t('events.date')}: {event.date}</Text>
      <Text>{t('events.price')}: {event.price}</Text>
      <Text>{t('events.organizer')}: John Doe</Text>
      <Button title={t('booking.buyTickets')} onPress={handleBuy} />
    </View>
  );
}
```

---

## Common Translation Keys by Page

### Chat.tsx
```tsx
const { t } = useLocalization();

// Typical keys needed
{t('chat.messages')}
{t('chat.writeAReply')}
{t('chat.noMessages')}
{t('chat.newMessage')}
{t('chat.onlineNow')}
{t('notifications.youHaveNewMessage')}  // If new key needed
```

### EventDetails.tsx
```tsx
const { t } = useLocalization();

// Typical keys needed
{t('events.eventDetails')}
{t('events.title')}
{t('events.date')}
{t('events.time')}
{t('events.price')}
{t('events.organizer')}
{t('events.location')}
{t('booking.buyTickets')}
{t('common.share')}  // If needed
```

### EditProfile.tsx
```tsx
const { t } = useLocalization();

// Typical keys needed
{t('profile.editProfile')}
{t('profile.name')}  // Add if needed
{t('profile.email')}  // Add if needed
{t('profile.aboutMe')}
{t('profile.country')}
{t('profile.interests')}
{t('profile.uploadAvatar')}
{t('common.save')}
{t('common.cancel')}
```

### BuyTicket.tsx
```tsx
const { t } = useLocalization();

// Typical keys needed
{t('booking.selectTicketType')}
{t('booking.quantity')}
{t('booking.totalPrice')}
{t('booking.checkout')}
{t('booking.bookTicket')}
{t('common.continue')}  // Add if needed
```

### Payment.tsx
```tsx
const { t } = useLocalization();

// Typical keys needed
{t('booking.paymentMethod')}
{t('booking.creditCard')}
{t('booking.wallet')}
{t('booking.paypal')}
{t('booking.checkout')}
{t('common.pay')}  // Add if needed
```

---

## How to Add Missing Translation Keys

If you need a key that doesn't exist:

### 1. Add to English locale (`frontend/locales/en.ts`):
```tsx
// Find or create the appropriate section
common: {
  // ... existing keys
  continue: 'Continue',  // ← NEW KEY
}
```

### 2. Add to Vietnamese locale (`frontend/locales/vi.ts`):
```tsx
// Same section with Vietnamese translation
common: {
  // ... existing keys
  continue: 'Tiếp tục',  // ← NEW KEY (Vietnamese)
}
```

### 3. Use in component:
```tsx
<Button title={t('common.continue')} />
```

---

## Template: Translating a New Page

Copy this template and fill in your specific page:

```tsx
// Step 1: Add import
import { useLocalization } from '../context/LocalizationContext';

export default function YourPageName() {
  // Step 2: Add hook
  const { t } = useLocalization();
  
  // ... rest of your component
  
  return (
    <View>
      {/* Step 3: Replace all hardcoded strings */}
      <Text>{t('section.key')}</Text>
      {/* Repeat for each hardcoded string */}
    </View>
  );
}
```

---

## Verification Checklist

After translating a page:

- [ ] Import `useLocalization` added
- [ ] `const { t } = useLocalization()` added to component
- [ ] All hardcoded text replaced with `t('key')`
- [ ] All translation keys exist in both `en.ts` and `vi.ts`
- [ ] Tested: Switch language in Settings and verify page updates
- [ ] No console errors about missing translations
- [ ] Proper nouns (user names, event names) NOT translated

---

## Quick Lookup: Existing Translation Keys

All available translation keys are organized by category:

```
common.*              → Common UI (search, filter, save, cancel, hello...)
auth.*               → Authentication (signIn, signUp, email, password...)
home.*               → Home page (myEvents, viewAll, chooseByCategory...)
events.*             → Event management (createEvent, title, date, price...)
search.*             → Search UI (search, findAmazingEvents...)
chat.*               → Messaging (messages, writeAReply, noMessages...)
notifications.*      → Alerts (notifications, noNotifications...)
profile.*            → User profile (editProfile, aboutMe, interests...)
settings.*           → App settings (language, logout...)
booking.*            → Ticket & payment (buyTickets, totalPrice, checkout...)
invitations.*        → Friend invites (inviteFriend, invitationSent...)
errors.*             → Error messages (required, invalidEmail...)
time.*               → Date/time labels (today, tomorrow, just_now...)
```

**For the complete list, refer to `/frontend/locales/en.ts`**

---

## Need Help?

1. Review the completed examples: Profile.tsx, Home.tsx, Search.tsx, Settings.tsx
2. Check the locale files for available keys: `/frontend/locales/en.ts` and `/frontend/locales/vi.ts`
3. Follow the 3-Step Pattern for consistency
4. Test immediately: Run app and switch language in Settings
