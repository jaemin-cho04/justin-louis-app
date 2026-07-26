begin;
select plan(35);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'app_snapshots', 'snapshots table exists');
select has_table('public', 'friend_requests', 'friend requests table exists');
select has_table('public', 'friendships', 'friendships table exists');
select has_table('public', 'social_summaries', 'social summaries table exists');
select has_table('public', 'friend_comments', 'friend comments table exists');
select has_table('public', 'friendship_preferences', 'friend preferences table exists');
select has_table('public', 'invites', 'invites table exists');
select has_table('public', 'project_collaborators', 'collaborators table exists');
select has_table('public', 'shared_projects', 'shared projects table exists');
select has_table('public', 'push_tokens', 'push tokens table exists');
select has_table('public', 'notification_preferences', 'notification preferences table exists');
select has_table('public', 'notification_deliveries', 'notification delivery rate-limit table exists');
select has_table('public', 'media_objects', 'media metadata table exists');

select has_function('public', 'accept_friend_request', array['uuid'], 'friend request acceptance RPC exists');
select has_function('public', 'decline_friend_request', array['uuid'], 'friend request decline RPC exists');
select has_function('public', 'cancel_friend_request', array['uuid'], 'friend request cancellation RPC exists');
select has_function('public', 'accept_invite', array['text'], 'invite acceptance RPC exists');
select has_function('public', 'update_shared_project', array['text', 'jsonb'], 'shared project update RPC exists');
select has_function('public', 'find_profile_by_handle', array['text'], 'privacy-preserving exact profile lookup exists');
select has_function('public', 'save_app_snapshot', array['bigint', 'integer', 'jsonb'], 'atomic snapshot save RPC exists');
select has_function('public', 'delete_shared_project', array['text'], 'shared project cleanup RPC exists');

select ok((select relrowsecurity from pg_class where oid = 'public.app_snapshots'::regclass), 'snapshots enforce RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.friend_requests'::regclass), 'friend requests enforce RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.shared_projects'::regclass), 'shared projects enforce RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.media_objects'::regclass), 'media metadata enforces RLS');
select ok((select bool_and(relrowsecurity) from pg_class where oid in (
  'public.profiles'::regclass, 'public.friendships'::regclass, 'public.friend_comments'::regclass,
  'public.invites'::regclass, 'public.project_collaborators'::regclass, 'public.push_tokens'::regclass,
  'public.notification_preferences'::regclass
)), 'all multi-user client tables enforce RLS');
select ok((select count(*) = 0 from pg_policies where schemaname = 'public' and tablename in ('security_events', 'notification_deliveries')), 'service-only audit tables expose no client policies');
select ok(not has_function_privilege('anon', 'public.accept_invite(text)', 'execute'), 'anonymous users cannot execute invite acceptance');
select ok(not has_function_privilege('anon', 'public.cancel_friend_request(uuid)', 'execute'), 'anonymous users cannot cancel friend requests');
select ok(not has_function_privilege('anon', 'public.save_app_snapshot(bigint,integer,jsonb)', 'execute'), 'anonymous users cannot save snapshots');
select ok(has_function_privilege('authenticated', 'public.save_app_snapshot(bigint,integer,jsonb)', 'execute'), 'authenticated users can use the atomic snapshot RPC');
select ok((select count(*) = 9 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename in (
  'friend_requests', 'friendships', 'friend_comments', 'friendship_preferences', 'social_summaries', 'invites', 'project_collaborators', 'shared_projects', 'app_snapshots'
)), 'all synchronized tables are in the realtime publication');
select ok((select not public and file_size_limit = 10485760 from storage.buckets where id = 'progress-media'), 'media bucket is private with a 10 MiB limit');
select ok((select count(*) >= 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_storage_insert_own'), 'private media insert policy exists');

select * from finish();
rollback;
