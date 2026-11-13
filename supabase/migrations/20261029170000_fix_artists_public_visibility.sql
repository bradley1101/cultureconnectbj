-- Les visiteurs ne peuvent pas lire public.profiles (RLS) : la sous-requête
-- de la policy "artistes visibles" échouait toujours pour eux.
create or replace function private.is_approved_artist(artist_id uuid)
returns boolean
language sql
stable security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = artist_id and p.status = 'approved'
  );
$$;

revoke execute on function private.is_approved_artist(uuid) from public;
grant execute on function private.is_approved_artist(uuid) to anon, authenticated, service_role;

drop policy "artistes visibles" on public.artists;
create policy "artistes visibles" on public.artists
  for select
  using (
    private.is_approved_artist(id)
    or (select auth.uid()) = id
    or private.is_admin()
  );
