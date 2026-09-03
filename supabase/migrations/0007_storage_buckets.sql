-- ============================================================================
-- 0007_storage_buckets.sql
-- Two buckets with deliberately different privacy models — see "Storage
-- Buckets & File Upload Strategy" in the response for the reasoning.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- avatars — PUBLIC-READ. Avatar images appear on public business cards, so
-- there is no confidentiality benefit to signed URLs here; public read
-- keeps <img> tags simple and cacheable via a CDN.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Upload path convention: avatars/{owner_id}/{card_id}.{ext}
-- Enforced by the RLS policy below via storage.foldername(name).

create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_owner_upload
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy avatars_owner_update
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy avatars_owner_delete
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- card-exports — PRIVATE. Server-rendered PNG/PDF exports (see "Card Image
-- Generation Strategy"). Kept private and served only via short-lived
-- signed URLs, both because exports may embed contact details the owner
-- doesn't want indexable/hotlinkable, and to keep the free-tier download
-- gate (register_card_download) as the only path to a usable file URL.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-exports',
  'card-exports',
  false,
  10485760, -- 10 MB
  array['image/png', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Upload path convention: card-exports/{owner_id}/{card_id}/{download_id}.{ext}
-- Writes happen only from the render-card-export Edge Function using the
-- service_role key (bypasses RLS) — no INSERT policy is granted to
-- authenticated/anon at all, mirroring the downloads table's write model.

create policy card_exports_owner_read
  on storage.objects for select
  using (
    bucket_id = 'card-exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy card_exports_owner_delete
  on storage.objects for delete
  using (
    bucket_id = 'card-exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
