# Facilitator Authentication & Personal Account Setup

## Overview

The facilitator management system now includes:
- **Supabase-backed authentication** for facilitators
- **Personal account page** (`/personal-account`) for editing all facilitator data
- **Protected routes** that require authentication
- **Public facilitator pages** that display data from Supabase

## Files Added/Modified

### New Files Created:
1. `client/lib/supabase.ts` - Supabase client initialization
2. `client/hooks/useAuth.tsx` - Authentication context and hook
3. `client/pages/Login.tsx` - Login page
4. `client/pages/PersonalAccount.tsx` - Personal account/dashboard with edit forms
5. `client/components/ProtectedRoute.tsx` - Route protection component

### Modified Files:
1. `client/App.tsx` - Added AuthProvider and new routes
2. `client/pages/FacilitatorDetail.tsx` - Updated to fetch from Supabase
3. `package.json` - Added @supabase/supabase-js dependency

## Setup Instructions

### Step 1: Configure Supabase Database

Follow the instructions in `SUPABASE_SETUP.md` to:
1. Create the `facilitators` table in your Supabase project
2. Insert initial facilitator data
3. Set proper password hashes

**Important**: The default setup uses placeholder passwords for testing. Replace with real passwords in production.

### Step 2: Verify Environment Variables

The following environment variables should be set (already configured):
```
VITE_SUPABASE_URL=https://jryimtflxsjydoeeiljz.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are loaded from the system environment automatically.

### Step 3: Test the System

#### Access the Public Facilitator Pages:
1. Navigate to `http://localhost:port/facilitators` to see the facilitator list
2. Click on any facilitator to see their detail page (data loaded from Supabase)

#### Test Authentication:
1. Go to `http://localhost:port/login`
2. Use these test credentials:
   - Email: `alina@example.com`
   - Password: (set via Supabase or test with placeholder)
3. After login, you'll be redirected to `/personal-account`

#### Test Personal Account Features:
1. Edit any field on the personal account page
2. Click "Сохранить изменения" to save
3. Verify changes appear on the public facilitator page
4. Logout using the "Выйти" button

## Editable Fields

The following fields are editable in the personal account:

### Basic Information Tab:
- Name (Имя)
- City (Город)
- Tagline (Подзаголовок)
- Email (contact)
- Telegram link
- WhatsApp link

### Details Tab:
- Description (Описание)
- Rating (Рейтинг)
- Cost (Стоимость)
- Photo URL (with preview)
- Video URL (YouTube embed)
- Session Types (Индивидуальные/Групповые)
- Format (Онлайн/Оффлайн)

### Schedule Tab:
- Add/edit/delete sessions
- Each session includes: city, date, location, time, cost

### Reviews Tab:
- Add/edit/delete reviews
- Each review includes: name, text, photo URL

## Authentication Flow

1. **Login** (`/login`):
   - User enters email and password
   - System queries Supabase for the facilitator
   - On success, credentials are stored in localStorage
   - User is redirected to `/personal-account`

2. **Protected Route** (`/personal-account`):
   - `ProtectedRoute` component checks `useAuth()` hook
   - If not authenticated, redirects to `/login`
   - If authenticated, renders `PersonalAccount` page

3. **Data Fetching**:
   - `PersonalAccount` uses `useAuth()` to get `facilitatorId`
   - Fetches facilitator data from Supabase on component mount
   - Updates data in real-time as user edits

4. **Logout**:
   - Clears localStorage
   - Redirects to `/login`

## Security Considerations

### Current Implementation:
- Email/password stored in Supabase `facilitators` table
- Auth state stored in localStorage (suitable for development)
- No RLS (Row Level Security) configured by default

### For Production:
1. **Use Supabase Auth Service** instead of custom implementation
   - Supports OAuth, magic links, multi-factor authentication
   - Better security with proper session management
   - Automatic password hashing with bcrypt

2. **Enable Row Level Security (RLS)**:
   ```sql
   -- Allow facilitators to only see/edit their own data
   ALTER TABLE facilitators ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Facilitators can view own data"
   ON facilitators FOR SELECT
   USING (auth.uid()::text = id);
   
   CREATE POLICY "Facilitators can update own data"
   ON facilitators FOR UPDATE
   USING (auth.uid()::text = id);
   ```

3. **Use HTTPS** and secure cookies
4. **Implement proper password hashing** (bcrypt, Argon2, etc.)
5. **Add rate limiting** on login attempts
6. **Enable audit logging** in Supabase

## Troubleshooting

### Login Not Working:
- Verify facilitator exists in database with correct email
- Check browser console for error messages
- Ensure Supabase credentials are correct in environment variables

### Changes Not Saving:
- Check network tab in browser DevTools
- Verify Supabase project permissions
- Check browser console for error messages

### Data Not Loading on Facilitator Pages:
- Ensure facilitator ID matches database
- Check if Supabase table has data
- Verify RLS policies allow reading data

## Private Login Link

The private login link for facilitators is:
```
https://your-domain.com/login
```

**Note**: Each facilitator should have their own unique credentials (email/password) provided separately.

## API Response Examples

### Login Request:
```javascript
const result = await login('alina@example.com', 'password');
// Returns: { success: boolean, error?: string }
```

### Fetch Facilitator Data:
```javascript
const { data, error } = await supabase
  .from('facilitators')
  .select('*')
  .eq('id', facilitatorId)
  .single();
```

### Update Facilitator Data:
```javascript
const { error } = await supabase
  .from('facilitators')
  .update({
    name: 'New Name',
    description: 'New description',
    // ... other fields
  })
  .eq('id', facilitatorId);
```

## Next Steps

1. Set up Supabase tables (see SUPABASE_SETUP.md)
2. Add initial facilitator data
3. Test login and personal account functionality
4. Update password hashing for security
5. Configure RLS for production
6. Deploy to production environment
