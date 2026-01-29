-- Create table for socio files
create table if not exists socio_archivos (
  id uuid primary key default uuid_generate_v4(),
  socio_id uuid references socios(id) on delete cascade not null,
  nombre text not null,
  url text not null,
  tipo text not null, -- 'image/png', 'application/pdf', etc.
  peso integer not null, -- size in bytes
  created_at timestamp with time zone default now()
);

-- Add index
create index if not exists idx_socio_archivos_socio_id on socio_archivos(socio_id);

-- Enable RLS
alter table socio_archivos enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on socio_archivos
  for all using (auth.role() = 'authenticated');

-- Storage bucket setup (this usually needs to be done via dashboard or specific storage API, 
-- but we can try to insert into storage.buckets if we have permissions, 
-- though often this is metadata only)
insert into storage.buckets (id, name, public)
values ('socios-files', 'socios-files', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'socios-files' );

create policy "Authenticated users can update files"
on storage.objects for update
to authenticated
with check ( bucket_id = 'socios-files' );

create policy "Authenticated users can delete files"
on storage.objects for delete
to authenticated
using ( bucket_id = 'socios-files' );

create policy "Public access to read files"
on storage.objects for select
to public
using ( bucket_id = 'socios-files' );
