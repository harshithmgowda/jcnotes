-- Deletion audit table for tracking note deletions

create table if not exists deletion_audit (
  id uuid default uuid_generate_v4() primary key,
  note_id uuid,
  user_email text,
  action text not null,
  status text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional index to query by note_id quickly
create index if not exists idx_deletion_audit_note_id on deletion_audit(note_id);

