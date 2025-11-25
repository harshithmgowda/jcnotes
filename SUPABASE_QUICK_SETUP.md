# Supabase Setup - Quick Reference

## Step 1: Run Main Schema (Required)

Copy and run this in **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Enable UUID extension for unique IDs
create extension if not exists "uuid-ossp";

-- 2. Create Tables

-- Branches Table
create table branches (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Semesters Table (Linked to Branch)
create table semesters (
  id uuid default uuid_generate_v4() primary key,
  branch_id uuid references branches(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects Table (Linked to Semester)
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  semester_id uuid references semesters(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Units Table (Linked to Subject)
create table units (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references subjects(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes Table (Linked to Unit)
create table notes (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units(id) on delete cascade not null,
  title text not null,
  file_url text not null,
  file_name text not null,
  file_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Storage Setup
-- Insert 'notes' bucket if it doesn't exist.
insert into storage.buckets (id, name, public) 
values ('notes', 'notes', true)
on conflict (id) do nothing;

-- 4. Enable Row Level Security (RLS)
alter table branches enable row level security;
alter table semesters enable row level security;
alter table subjects enable row level security;
alter table units enable row level security;
alter table notes enable row level security;

-- 5. Policies (Permissions)

-- Allow everyone to READ data
create policy "Public read branches" on branches for select using (true);
create policy "Public read semesters" on semesters for select using (true);
create policy "Public read subjects" on subjects for select using (true);
create policy "Public read units" on units for select using (true);
create policy "Public read notes" on notes for select using (true);

-- Allow everyone to INSERT data
create policy "Public insert branches" on branches for insert with check (true);
create policy "Public insert semesters" on semesters for insert with check (true);
create policy "Public insert subjects" on subjects for insert with check (true);
create policy "Public insert units" on units for insert with check (true);
create policy "Public insert notes" on notes for insert with check (true);

-- Allow everyone to UPDATE data
create policy "Public update branches" on branches for update using (true);
create policy "Public update semesters" on semesters for update using (true);
create policy "Public update subjects" on subjects for update using (true);
create policy "Public update units" on units for update using (true);
create policy "Public update notes" on notes for update using (true);

-- Allow everyone to DELETE data
create policy "Public delete branches" on branches for delete using (true);
create policy "Public delete semesters" on semesters for delete using (true);
create policy "Public delete subjects" on subjects for delete using (true);
create policy "Public delete units" on units for delete using (true);
create policy "Public delete notes" on notes for delete using (true);

-- Storage Policies
create policy "Public upload files" on storage.objects for insert with check ( bucket_id = 'notes' );
create policy "Public read files" on storage.objects for select using ( bucket_id = 'notes' );
```

✅ Click **Run** (or Ctrl+Enter)

---

## Step 2: Add Storage DELETE Policy (Critical!)

⚠️ **This is REQUIRED for note deletion to work!**

Run this separately:

```sql
-- Allow deletion of files from storage
create policy "Public delete files"
on storage.objects
for delete
using ( bucket_id = 'notes' );

-- Optional: Allow file updates
create policy "Public update files"
on storage.objects
for update
using ( bucket_id = 'notes' );
```

✅ Click **Run**

---

## Verification

Run this to check all policies are created:

```sql
-- Check table policies
select schemaname, tablename, policyname, cmd 
from pg_policies 
where tablename in ('branches', 'semesters', 'subjects', 'units', 'notes', 'objects')
order by tablename, cmd;
```

**Expected results:**
- Each table should have SELECT, INSERT, UPDATE, DELETE policies
- `objects` (storage) should have SELECT, INSERT, UPDATE, DELETE policies

---

## Troubleshooting

### If deletion still doesn't work:

1. **Verify policy exists:**
```sql
select * from pg_policies where tablename = 'objects' and cmd = 'DELETE';
```

Should return a row with `policyname = 'Public delete files'`

2. **Check bucket name:**
```sql
select * from storage.buckets where id = 'notes';
```

Should return one row with `public = true`

3. **Test storage deletion manually:**

Go to **Storage** → **notes** bucket → try deleting a file via UI

If it fails, the policy isn't working. Re-run Step 2.

---

## Quick Test

After running both steps:

1. Open your app → Admin Dashboard
2. Upload a test note
3. Delete it
4. Open browser console (F12) - should see:
   - ✅ Storage file deleted successfully
   - ✅ Database record deleted successfully
5. Refresh page - note should stay deleted

---

## Need Help?

- Open browser console (F12) for detailed error messages
- Check `DELETE_FIX_README.md` for troubleshooting
- Verify `.env.local` has correct credentials

