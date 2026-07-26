create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.friend_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.collaboration_role as enum ('viewer', 'editor');
create type public.invite_kind as enum ('friend', 'collaborator');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle extensions.citext not null unique,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (handle::text ~ '^[A-Za-z0-9_]{3,32}$')
);

create table public.app_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  schema_version integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.friend_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status public.friend_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id <> recipient_id)
);
create unique index friend_requests_one_pending_pair
  on public.friend_requests (least(sender_id, recipient_id), greatest(sender_id, recipient_id))
  where status = 'pending';
create index friend_requests_recipient_status on public.friend_requests (recipient_id, status);

create table public.friendships (
  id uuid primary key default extensions.gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.social_summaries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completion integer not null default 0 check (completion between 0 and 100),
  focus text not null default 'Shared progress' check (char_length(focus) between 1 and 120),
  last_signal text not null default 'No recent signal' check (char_length(last_signal) between 1 and 180),
  updated_at timestamptz not null default now()
);

create table public.friend_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  friendship_id uuid not null references public.friendships(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index friend_comments_friendship_created on public.friend_comments (friendship_id, created_at);

create table public.friendship_preferences (
  friendship_id uuid not null references public.friendships(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feedback_mode text not null default 'cheersOnly' check (feedback_mode in ('cheersOnly', 'critiqueOpen')),
  updated_at timestamptz not null default now(),
  primary key (friendship_id, user_id)
);

create table public.invites (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique default encode(extensions.gen_random_bytes(8), 'hex'),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  kind public.invite_kind not null,
  project_id text,
  role public.collaboration_role,
  expires_at timestamptz not null default (now() + interval '7 days'),
  max_uses integer not null default 1 check (max_uses between 1 and 100),
  use_count integer not null default 0 check (use_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check ((kind = 'friend' and project_id is null and role is null) or (kind = 'collaborator' and project_id is not null and role is not null))
);

create table public.project_collaborators (
  project_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.collaboration_role not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id),
  check (owner_id <> user_id)
);
create index project_collaborators_user on public.project_collaborators (user_id, project_id);

create table public.shared_projects (
  project_id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_planning boolean not null default true,
  encouragement boolean not null default true,
  memories boolean not null default true,
  own_task_reminders boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.media_objects (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  byte_size bigint check (byte_size is null or byte_size between 1 and 10485760),
  created_at timestamptz not null default now()
);

create table public.security_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id bigint generated always as identity primary key,
  sender_id uuid references auth.users(id) on delete set null,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index notification_deliveries_rate_limit on public.notification_deliveries (sender_id, recipient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.app_snapshots enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.social_summaries enable row level security;
alter table public.friend_comments enable row level security;
alter table public.friendship_preferences enable row level security;
alter table public.invites enable row level security;
alter table public.project_collaborators enable row level security;
alter table public.shared_projects enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.media_objects enable row level security;
alter table public.security_events enable row level security;
alter table public.notification_deliveries enable row level security;

create policy profiles_read_connections on public.profiles for select to authenticated using (
  id = auth.uid()
  or exists (select 1 from public.friendships connection where auth.uid() in (connection.user_a, connection.user_b) and profiles.id in (connection.user_a, connection.user_b))
  or exists (select 1 from public.friend_requests request where auth.uid() in (request.sender_id, request.recipient_id) and profiles.id in (request.sender_id, request.recipient_id))
  or exists (select 1 from public.project_collaborators membership where auth.uid() in (membership.owner_id, membership.user_id) and profiles.id in (membership.owner_id, membership.user_id))
);
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy snapshots_self on public.app_snapshots for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy requests_read_participant on public.friend_requests for select to authenticated using (auth.uid() in (sender_id, recipient_id));
create policy requests_send_self on public.friend_requests for insert to authenticated with check (sender_id = auth.uid() and status = 'pending');
create policy requests_cancel_sender on public.friend_requests for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid() and status = 'cancelled');
create policy friendships_read_participant on public.friendships for select to authenticated using (auth.uid() in (user_a, user_b));
create policy friendships_delete_participant on public.friendships for delete to authenticated using (auth.uid() in (user_a, user_b));
create policy summaries_manage_self on public.social_summaries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy summaries_read_friends on public.social_summaries for select to authenticated using (
  exists (select 1 from public.friendships connection where social_summaries.user_id in (connection.user_a, connection.user_b) and auth.uid() in (connection.user_a, connection.user_b))
);
create policy friend_comments_read_participant on public.friend_comments for select to authenticated using (
  exists (select 1 from public.friendships connection where connection.id = friend_comments.friendship_id and auth.uid() in (connection.user_a, connection.user_b))
);
create policy friend_comments_add_participant on public.friend_comments for insert to authenticated with check (
  author_id = auth.uid() and exists (select 1 from public.friendships connection where connection.id = friend_comments.friendship_id and auth.uid() in (connection.user_a, connection.user_b))
);
create policy friend_comments_delete_author on public.friend_comments for delete to authenticated using (author_id = auth.uid());
create policy friendship_preferences_self on public.friendship_preferences for all to authenticated using (user_id = auth.uid()) with check (
  user_id = auth.uid() and exists (select 1 from public.friendships connection where connection.id = friendship_preferences.friendship_id and auth.uid() in (connection.user_a, connection.user_b))
);
create policy invites_manage_owner on public.invites for all to authenticated using (inviter_id = auth.uid()) with check (
  inviter_id = auth.uid() and (
    kind = 'friend' or exists (select 1 from public.shared_projects project where project.project_id = invites.project_id and project.owner_id = auth.uid())
  )
);
create policy collaborators_read_participant on public.project_collaborators for select to authenticated using (owner_id = auth.uid() or user_id = auth.uid());
create policy collaborators_manage_owner on public.project_collaborators for all to authenticated using (owner_id = auth.uid()) with check (
  owner_id = auth.uid() and exists (select 1 from public.shared_projects project where project.project_id = project_collaborators.project_id and project.owner_id = auth.uid())
);
create policy collaborators_leave_self on public.project_collaborators for delete to authenticated using (user_id = auth.uid());
create policy shared_projects_owner on public.shared_projects for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy shared_projects_collaborator_read on public.shared_projects for select to authenticated using (
  exists (select 1 from public.project_collaborators membership where membership.project_id = shared_projects.project_id and membership.user_id = auth.uid())
);
create policy shared_projects_editor_update on public.shared_projects for update to authenticated using (
  exists (select 1 from public.project_collaborators membership where membership.project_id = shared_projects.project_id and membership.user_id = auth.uid() and membership.role = 'editor')
) with check (
  exists (select 1 from public.project_collaborators membership where membership.project_id = shared_projects.project_id and membership.user_id = auth.uid() and membership.role = 'editor')
);
create policy push_tokens_self on public.push_tokens for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_preferences_self on public.notification_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy media_self on public.media_objects for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'handle', ''), 'user_' || left(replace(new.id::text, '-', ''), 10)),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'Progress user'), '@', 1))
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
revoke execute on function public.handle_new_user() from public;

create or replace function public.accept_friend_request(request_id uuid) returns void
language plpgsql security definer set search_path = public
as $$
declare request_row public.friend_requests;
begin
  select * into request_row from public.friend_requests where id = request_id for update;
  if request_row.id is null or request_row.recipient_id <> auth.uid() or request_row.status <> 'pending' then
    raise exception 'Friend request is not available' using errcode = '42501';
  end if;
  insert into public.friendships (user_a, user_b)
  values (least(request_row.sender_id, request_row.recipient_id), greatest(request_row.sender_id, request_row.recipient_id))
  on conflict do nothing;
  update public.friend_requests set status = 'accepted', responded_at = now() where id = request_id;
end;
$$;
revoke execute on function public.accept_friend_request(uuid) from public;
grant execute on function public.accept_friend_request(uuid) to authenticated;

create or replace function public.decline_friend_request(request_id uuid) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.friend_requests request
    where request.id = request_id and request.recipient_id = auth.uid() and request.status = 'pending'
  ) then
    raise exception 'Friend request is not available' using errcode = '42501';
  end if;
  update public.friend_requests set status = 'declined', responded_at = now()
  where id = request_id and recipient_id = auth.uid() and status = 'pending';
end;
$$;
revoke execute on function public.decline_friend_request(uuid) from public;
grant execute on function public.decline_friend_request(uuid) to authenticated;

create or replace function public.cancel_friend_request(request_id uuid) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.friend_requests request
    where request.id = request_id and request.sender_id = auth.uid() and request.status = 'pending'
  ) then
    raise exception 'Friend request is not available' using errcode = '42501';
  end if;
  update public.friend_requests set status = 'cancelled', responded_at = now()
  where id = request_id and sender_id = auth.uid() and status = 'pending';
end;
$$;
revoke execute on function public.cancel_friend_request(uuid) from public;
grant execute on function public.cancel_friend_request(uuid) to authenticated;

create or replace function public.accept_invite(invite_code text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare invite_row public.invites;
begin
  select * into invite_row from public.invites
  where code = invite_code and revoked_at is null and expires_at > now() and use_count < max_uses for update;
  if invite_row.id is null or invite_row.inviter_id = auth.uid() then
    raise exception 'Invite is invalid or unavailable' using errcode = '42501';
  end if;
  if invite_row.kind = 'friend' then
    insert into public.friendships (user_a, user_b)
    values (least(invite_row.inviter_id, auth.uid()), greatest(invite_row.inviter_id, auth.uid()))
    on conflict do nothing;
  else
    insert into public.project_collaborators (project_id, owner_id, user_id, role)
    values (invite_row.project_id, invite_row.inviter_id, auth.uid(), invite_row.role)
    on conflict (project_id, user_id) do update set role = excluded.role;
  end if;
  update public.invites set use_count = use_count + 1 where id = invite_row.id;
  return jsonb_build_object('kind', invite_row.kind, 'project_id', invite_row.project_id, 'role', invite_row.role);
end;
$$;
revoke execute on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated;

create or replace function public.find_profile_by_handle(exact_handle text)
returns table (id uuid, handle text, display_name text, avatar_path text)
language sql security definer stable set search_path = public
as $$
  select profile.id, profile.handle::text, profile.display_name, profile.avatar_path
  from public.profiles profile
  where profile.handle = trim(leading '@' from exact_handle)::extensions.citext
    and profile.id <> auth.uid()
  limit 1;
$$;
revoke execute on function public.find_profile_by_handle(text) from public;
grant execute on function public.find_profile_by_handle(text) to authenticated;

create or replace function public.update_shared_project(target_project_id text, project_data jsonb) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.shared_projects project
    where project.project_id = target_project_id and (
      project.owner_id = auth.uid() or exists (
        select 1 from public.project_collaborators membership
        where membership.project_id = target_project_id and membership.user_id = auth.uid() and membership.role = 'editor'
      )
    )
  ) then
    raise exception 'Project edit is not permitted' using errcode = '42501';
  end if;
  update public.shared_projects set data = project_data, revision = revision + 1, updated_at = now()
  where project_id = target_project_id;
end;
$$;
revoke execute on function public.update_shared_project(text, jsonb) from public;
grant execute on function public.update_shared_project(text, jsonb) to authenticated;

create or replace function public.delete_shared_project(target_project_id text) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.shared_projects where project_id = target_project_id and owner_id = auth.uid()) then
    raise exception 'Only the project owner can delete shared collaboration data' using errcode = '42501';
  end if;
  delete from public.invites where project_id = target_project_id and inviter_id = auth.uid();
  delete from public.project_collaborators where project_id = target_project_id and owner_id = auth.uid();
  delete from public.shared_projects where project_id = target_project_id and owner_id = auth.uid();
end;
$$;
revoke execute on function public.delete_shared_project(text) from public;
grant execute on function public.delete_shared_project(text) to authenticated;

create or replace function public.save_app_snapshot(
  expected_revision bigint,
  next_schema_version integer,
  next_data jsonb
) returns table (revision bigint, updated_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare current_revision bigint;
begin
  select snapshot.revision into current_revision
  from public.app_snapshots snapshot
  where snapshot.user_id = auth.uid()
  for update;

  if current_revision is null then
    if expected_revision <> 0 then
      raise exception 'Snapshot revision conflict' using errcode = '40001';
    end if;
    return query insert into public.app_snapshots (user_id, revision, schema_version, data, updated_at)
      values (auth.uid(), 1, next_schema_version, next_data, now())
      returning app_snapshots.revision, app_snapshots.updated_at;
  end if;

  if current_revision <> expected_revision then
    raise exception 'Snapshot revision conflict' using errcode = '40001';
  end if;

  return query update public.app_snapshots
    set revision = current_revision + 1, schema_version = next_schema_version, data = next_data, updated_at = now()
    where user_id = auth.uid()
    returning app_snapshots.revision, app_snapshots.updated_at;
end;
$$;
revoke execute on function public.save_app_snapshot(bigint, integer, jsonb) from public;
grant execute on function public.save_app_snapshot(bigint, integer, jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-media', 'progress-media', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy media_storage_read_own on storage.objects for select to authenticated
using (bucket_id = 'progress-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_storage_insert_own on storage.objects for insert to authenticated
with check (bucket_id = 'progress-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_storage_update_own on storage.objects for update to authenticated
using (bucket_id = 'progress-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_storage_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'progress-media' and (storage.foldername(name))[1] = auth.uid()::text);

alter publication supabase_realtime add table
  public.friend_requests,
  public.friendships,
  public.friend_comments,
  public.friendship_preferences,
  public.social_summaries,
  public.invites,
  public.project_collaborators,
  public.shared_projects,
  public.app_snapshots;
