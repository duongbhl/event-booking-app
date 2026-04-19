# Multi-Language Implementation Guide (Vietnamese & English)

## ✅ What's Been Completed

### 1. **Translation Architecture**
- ✅ English locale file: `frontend/locales/en.ts` (100+ translation keys)
- ✅ Vietnamese locale file: `frontend/locales/vi.ts` (matching structure)
- ✅ LocalizationContext: `frontend/context/LocalizationContext.tsx` (language state management)
- ✅ Settings page: `frontend/pages/Profile/Settings.tsx` (language selector)

### 2. **Pages Updated with Translations**
- ✅ Profile.tsx - Uses `t()` for labels (Followers, Following, Events, About Me, Country, Interests)
- ✅ Home.tsx - Uses `t()` for search placeholder, "My Events", "View All", "Choose By Category"
- ✅ Settings.tsx - Fully translated with language picker

### 3. **Integration Points**
- ✅ App.tsx - Wrapped with `<LocalizationProvider>`
- ✅ RootNavigator.tsx - Settings screen added
- ✅ Profile.tsx - Settings button added in profile header
- ✅ AsyncStorage - Language preference persists across app restarts

## 📋 Translation Keys Available

### Common (13 keys)
- search, filter, save, cancel, delete, edit, back, next, loading, error, success, confirmation, areYouSure, hello

### Auth (11 keys)
- signIn, signUp, email, password, confirmPassword, name, forgotPassword, resetPassword, verification, enterVerificationCode, resendCode, signOut, dontHaveAccount, alreadyHaveAccount

### Home (7 keys)
- home, upcomingEvents, viewAll, myEvents, noEvents, startConversation, chooseByCategory, findAmazingEvents

### Events (15 keys)
- events, createEvent, editEvent, eventDetails, title, description, category, price, date, time, location, organizer, members, myEvent, addEvent, eventDeleted, eventCreated, eventUpdated

### Search (3 keys)
- search, findAmazingEvents, noUsersFound, searchUsers, searchForEvents

### Chat (9 keys)
- messages, message, chat, writeAReply, sendMessage, noMessages, newMessage, onlineNow

### Notifications (7 keys)
- notifications, noNotifications, markAsRead, paymentSuccessful, newInvitation, eventReminder, newMessage

### Profile (12 keys)
- profile, editProfile, myProfile, followersCount, followingCount, eventsCount, aboutMe, country, interests, description, noDescriptionYet, addCountry, profileUpdated, uploadAvatar

### Settings (8 keys)
- settings, language, english, vietnamese, notifications, enableNotifications, privacy, about, logout, logoutConfirm

### Booking & Payment (10 keys)
- tickets, buyTickets, bookTicket, quantity, totalPrice, selectTicketType, purchaseConfirmed, paymentMethod, creditCard, wallet, paypal, checkout

### Invitations (3 keys)
- inviteFriend, sendInvitation, invitationSent, selectAtLeastOne

### Errors (9 keys)
- required, invalidEmail, passwordTooShort, passwordMismatch, networkError, serverError, notFound, unauthorized, forbidden

### Time & Date (9 keys)
- today, tomorrow, thisWeek, thisMonth, just_now, minute_ago, minutes_ago, hour_ago, hours_ago, day_ago, days_ago

## 🚀 How to Use Translations

### In Any Component:

```tsx
import { useLocalization } from '../context/LocalizationContext';

export default function MyComponent() {
  const { t, language, setLanguage } = useLocalization();
  
  return (
    <>
      <Text>{t('auth.signIn')}</Text>
      <Text>Current language: {language}</Text>
      <Button onPress={() => setLanguage('vi')} title="Vietnamese" />
    </>
  );
}
```

### Translation Methods:
- `t('key')` - Get translation using dot notation (e.g., `t('profile.editProfile')`)
- `language` - Get current language ('en' or 'vi')
- `setLanguage(lang)` - Switch language (persists to AsyncStorage)

## 📝 Pages Needing Translation (Priority Order)

### HIGH PRIORITY (User-facing, frequently used)

1. **Chat.tsx** - Message UI, buttons, empty states
   - Hardcoded: "Type a message", message timestamps, read indicators
   
2. **EventDetails.tsx** - Event information display
   - Hardcoded: Event info labels (date, time, location, price, organizer)
   
3. **EditProfile.tsx** - Profile form
   - Hardcoded: Form labels (name, email, bio, country, interests)
   
4. **BuyTicket.tsx** - Ticket purchase flow
   - Hardcoded: Quantity selector, ticket types, "Buy Now", "Continue"
   
5. **Payment.tsx** - Payment form
   - Hardcoded: Payment method labels, card fields, "Pay Now"

### MEDIUM PRIORITY

6. **Search.tsx** - Search interface
   - Hardcoded: "Clear all", filter prompts, "No results"
   
7. **InviteFriend.tsx** - Friend invitation
   - Hardcoded: "Select friends", "Send", "Invitation sent"
   
8. **MyEvent.tsx** / **Events.tsx** - Event management
   - Hardcoded: "Create Event", "Edit", "Delete", "Publish"
   
9. **Bookmark.tsx** - Saved events
   - Hardcoded: "Save", "Unsave", "Saved Events"
   
10. **Notification.tsx** - Notification center
    - Hardcoded: Notification types, timestamps, actions

### LOW PRIORITY (Admin/Utility)

11. Admin screens - Admin-specific UI
12. Calendar pages - Calendar labels
13. Location pages - Location UI

## 🔧 Step-by-Step: How to Translate a Page

### Example: Translating EventDetails.tsx

1. **Import useLocalization:**
   ```tsx
   import { useLocalization } from '../context/LocalizationContext';
   ```

2. **Get translation function in component:**
   ```tsx
   export default function EventDetails() {
     const { t } = useLocalization();
     // ... rest of component
   }
   ```

3. **Replace hardcoded strings:**
   ```tsx
   // BEFORE
   <Text>Event Date:</Text>
   
   // AFTER
   <Text>{t('events.date')}:</Text>
   ```

4. **If translation key doesn't exist, add it to both locales:**
   
   In `locales/en.ts`:
   ```tsx
   events: {
     // ... existing keys
     dateAndTime: 'Date & Time',
   }
   ```
   
   In `locales/vi.ts`:
   ```tsx
   events: {
     // ... existing keys
     dateAndTime: 'Ngày giờ',
   }
   ```

5. **Test:**
   - Run app in Settings and switch between English and Vietnamese
   - Verify correct translation appears on that page

## 🎯 Adding New Translation Keys

### When you need a key that doesn't exist:

1. **Add to both locale files** with same key structure:
   
   `locales/en.ts`:
   ```tsx
   permissions: {
     cameraAccess: 'Camera Access Required',
   }
   ```
   
   `locales/vi.ts`:
   ```tsx
   permissions: {
     cameraAccess: 'Cần quyền truy cập Camera',
   }
   ```

2. **Use in component:**
   ```tsx
   <Text>{t('permissions.cameraAccess')}</Text>
   ```

3. **If key not found, fallback returns the key itself** (helps debugging)

## 💾 Language Persistence

- Language choice is stored in AsyncStorage: `app-language`
- Automatically loaded on app startup
- Defaults to English if no preference saved
- Changes take effect immediately throughout app

## 🐛 Debugging Tips

1. **Missing translations?**
   - Check key spelling (case-sensitive)
   - Verify both en.ts and vi.ts have the key
   - Check dot notation in `t()` call

2. **Translation not updating?**
   - Make sure LocalizationProvider wraps the entire app
   - Component must use `useLocalization()` hook
   - Try hot reload or restart app

3. **AsyncStorage issues?**
   - Check device has enough storage
   - Clear app cache if issues persist
   - Check console logs for errors

## 📚 TypeScript Support

The translation system is fully typed. TypeScript will provide autocomplete for translation keys:

```tsx
const { t } = useLocalization();

// TypeScript autocomplete works (suggestions appear)
t('auth.') // Shows: signIn, signUp, email, password, etc.
```

## 🎨 Future Enhancements

1. **Number & Currency Formatting** - Format prices based on current language
2. **Date Formatting** - Show dates in proper format (DD/MM/YYYY vs MM/DD/YYYY)
3. **RTL Support** - Add right-to-left language support if needed
4. **Translation Management Tool** - Spreadsheet to manage translations
5. **System Language Detection** - Auto-detect device language on first launch

## 📞 Quick Reference: useLocalization Hook

```tsx
const {
  language,      // Current language: 'en' | 'vi'
  setLanguage,   // Function: (lang: 'en' | 'vi') => Promise<void>
  t,             // Function: (key: string) => string
  translations,  // Full translation object for current language
} = useLocalization();
```

---

**Total Translation Keys: 150+**
**Locales Supported: English (en), Vietnamese (vi)**
**Architecture: Context API + LocalizationContext + AsyncStorage**
