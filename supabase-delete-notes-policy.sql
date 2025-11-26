-- Add DELETE policy for notes table to allow note deletion
-- This allows public deletion - you can restrict to authenticated users if needed

-- First, make sure RLS is enabled on notes table
alter table notes enable row level security;

-- Add policy to allow deletion of notes
create policy "Public delete notes"
on notes
for delete
using (true);

-- Also ensure other tables allow cascade deletes
alter table branches enable row level security;
alter table semesters enable row level security;
alter table subjects enable row level security;
alter table units enable row level security;

-- Add delete policies for structure tables
create policy "Public delete branches"
on branches
for delete
using (true);

create policy "Public delete semesters"
on semesters
for delete
using (true);

create policy "Public delete subjects"
on subjects
for delete
using (true);

create policy "Public delete units"
on units
for delete
using (true);

