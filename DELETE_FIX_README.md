# Fix for Note Deletion Issue

## Problem
Notes are not being deleted permanently - they reappear after page refresh.

## Root Cause
Missing DELETE policy for Supabase Storage. The database has delete permissions, but the storage bucket does not.

## Solution

### 1. Add Storage Delete Policy (REQUIRED)

Go to your Supabase Dashboard:
1. Navigate to **Storage** → **Policies** → **notes bucket**
2. Click "New Policy"
3. Add the following policy:

```sql
create policy "Public delete files" 
on storage.objects 
for delete 
using ( bucket_id = 'notes' );
```

**OR** run the SQL in the SQL Editor:
- Go to **SQL Editor** in Supabase Dashboard
- Copy and paste the content from `supabase-delete-policy.sql`
- Click "Run"

### 2. Code Changes Made

Updated `AdminDashboard.tsx` with:
- Better error logging (check browser console for errors)
- Proper fetch after deletion
- Clearer error messages

### 3. Testing

After adding the storage policy:
1. Open browser DevTools (F12) → Console tab
2. Try deleting a note
3. Check console for any errors
4. The note should disappear and stay gone after refresh

### 4. Verification

If you see errors in console like:
- "new row violates row-level security policy" → Policy issue
- "permission denied" → Storage policy missing (this is likely the issue)
- No errors but note reappears → Clear browser cache

## Quick Test

1. Add the storage delete policy (step 1 above)
2. Refresh your app
3. Try deleting a note
4. Check console logs
5. Refresh page - note should stay deleted

