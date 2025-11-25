-- Add DELETE policy for storage to allow file deletion
-- This policy allows anyone to delete files from the 'notes' bucket
-- In production, you should restrict this to authenticated users only

create policy "Public delete files"
on storage.objects
for delete
using ( bucket_id = 'notes' );

-- Alternative: If you want to add UPDATE policy as well
create policy "Public update files"
on storage.objects
for update
using ( bucket_id = 'notes' );

