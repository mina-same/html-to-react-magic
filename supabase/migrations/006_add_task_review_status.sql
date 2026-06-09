-- Allow the task board's new review column in existing databases
alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('todo', 'doing', 'review', 'done'));
