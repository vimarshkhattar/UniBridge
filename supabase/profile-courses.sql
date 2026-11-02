/*
  Store each student's courses on their profile.

  Courses were silently dropped: the profile form collected them, but the save
  path never wrote them anywhere and the read path always returned an empty
  list, so the field went blank on every reload.

  The normalized courses / user_courses tables cannot hold free-text entries —
  `courses` is select-only for authenticated users, so a student typing a code
  that was never seeded could not be stored. Courses are free text in the UI,
  exactly like languages and preferred_activities, so they live on the profile
  the same way.

  Run this whole file in the Supabase SQL editor.
*/

alter table public.profiles
  add column if not exists courses text[] not null default '{}';
