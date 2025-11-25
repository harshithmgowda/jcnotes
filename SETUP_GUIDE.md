# JC Notes - Complete Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Set Up Supabase Database

Run the schema in your Supabase SQL Editor:

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the content from `schema.sql`
5. Click **Run** (or press Ctrl+Enter)

This will create:
- Tables: `branches`, `semesters`, `subjects`, `units`, `notes`
- Storage bucket: `notes`
- Row Level Security policies for public read/write access

### 4. **IMPORTANT:** Add Storage Delete Policy

⚠️ **Required for note deletion to work properly!**

In the same SQL Editor, run:

```sql
-- Allow deletion of files from storage
create policy "Public delete files"
on storage.objects
for delete
using ( bucket_id = 'notes' );
```

Or run the complete file:
```bash
# Copy content from supabase-delete-policy.sql and run in SQL Editor
```

**Why this is needed:** Without this policy, the app can delete database records but not the actual files, causing deleted notes to reappear.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

---

## 🎨 Features

### Dark Mode
- Toggle dark/light mode using the moon/sun icon in the navbar
- Preference is saved to localStorage and persists across sessions
- Respects system preference by default

### Admin Dashboard
- Upload notes organized by Branch → Semester → Subject → Unit
- Manage the entire structure (add/delete branches, semesters, subjects, units)
- Delete notes (both file and database record)
- View recent uploads

### Student Portal
- Browse notes by navigating through the hierarchy
- Download PDF files
- Clean, intuitive interface

---

## 🔧 Troubleshooting

### Problem: Notes reappear after deletion

**Solution:** Add the storage delete policy (see step 4 above)

1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
create policy "Public delete files"
on storage.objects
for delete
using ( bucket_id = 'notes' );
```
3. Test deletion again

**How to verify it worked:**
1. Open browser DevTools (F12) → Console
2. Delete a note
3. Look for these messages:
   - ✅ Storage file deleted successfully
   - ✅ Database record deleted successfully
4. Refresh page - note should stay deleted

### Problem: "Missing Supabase environment variables" error

**Solution:** Check your `.env.local` file

```bash
# Make sure the file exists
ls .env.local

# Check the content
cat .env.local
```

Variables must start with `VITE_` for Vite to expose them to the browser.

### Problem: Can't upload files / "Policy violation" error

**Solution:** Verify storage policies are set up

Run this in Supabase SQL Editor:

```sql
-- Check existing policies
select * from pg_policies where tablename = 'objects';
```

You should see policies for INSERT, SELECT, UPDATE, and DELETE on `storage.objects`.

If missing, re-run `schema.sql` or add them manually:

```sql
-- Storage policies for notes bucket
create policy "Public upload files" 
on storage.objects 
for insert 
with check ( bucket_id = 'notes' );

create policy "Public read files" 
on storage.objects 
for select 
using ( bucket_id = 'notes' );

create policy "Public delete files"
on storage.objects
for delete
using ( bucket_id = 'notes' );
```

### Problem: Dark mode not working

**Symptoms:**
- Toggle button doesn't change appearance
- Colors don't change between light/dark

**Solution:**

1. Check if `index.css` is loaded:
   - Open browser DevTools → Network tab
   - Refresh page
   - Look for `index.css` - should be status 200

2. Verify the toggle is working:
   - Open DevTools → Console
   - Toggle dark mode
   - Run: `document.documentElement.classList.contains('dark')`
   - Should return `true` when in dark mode

3. Check localStorage:
   - DevTools → Application tab → Local Storage
   - Look for key `jc_notes_dark`
   - Value should be `"true"` or `"false"`

### Problem: Build fails with TypeScript errors

**Solution:**

```bash
# Clean build artifacts
rm -rf dist node_modules/.vite

# Reinstall dependencies
npm install

# Try building again
npm run build
```

If errors persist, check:
- Node version: `node --version` (should be 18.x or higher)
- TypeScript version: `npx tsc --version`

---

## 📁 Project Structure

```
jc-notes/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation with dark mode toggle
│   ├── Button.tsx      # Custom button component
│   └── Footer.tsx      # Footer component
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Admin login
│   ├── StudentLogin.tsx    # Student name entry
│   ├── StudentPortal.tsx   # Student notes browser
│   └── AdminDashboard.tsx  # Admin panel
├── services/           # API and external services
│   └── supabase.ts    # Supabase client config
├── App.tsx            # Main app component with routes
├── index.tsx          # Entry point
├── index.css          # Global styles + dark mode variables
├── types.ts           # TypeScript type definitions
├── schema.sql         # Database schema
├── supabase-delete-policy.sql  # Storage policies
└── .env.local         # Environment variables (create this)
```

---

## 🔐 Security Notes

### For Development
The current setup uses public policies (anyone can read/write/delete) for quick development.

### For Production
Replace public policies with authenticated user policies:

```sql
-- Example: Restrict deletion to authenticated admins
create policy "Authenticated admins can delete files"
on storage.objects
for delete
using ( 
  bucket_id = 'notes' 
  AND auth.role() = 'authenticated'
  -- Add additional checks, e.g., user role from profiles table
);
```

Also consider:
- Adding user authentication (email/password)
- Creating an `admin_users` table with role-based access
- Rate limiting uploads
- File size limits (configure in Supabase Storage settings)
- Scanning uploaded files for malware

---

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

---

## 📞 Support

- Check browser console for detailed error logs (press F12)
- See `DELETE_FIX_README.md` for deletion troubleshooting
- Verify `.env.local` has correct Supabase credentials
- Ensure all SQL scripts have been run in Supabase

---

## 📄 License

MIT License - feel free to use this project for your needs!

