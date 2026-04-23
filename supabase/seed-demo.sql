-- Run after schema.sql and after at least one user exists.
-- Replace the email with your real lab assistant email.

update public.profiles
set role = 'lab_assistant',
    full_name = 'Saaad Liaqat'
where id = (
  select id from auth.users where email = 'saaadliaqat@gmail.com' limit 1
);

update public.profiles
set role = 'viewer',
    full_name = 'Principal'
where id = (
  select id from auth.users where email = 'principal@example.com' limit 1
);

insert into public.pc_issues (pc_id, issue_title, issue_details, priority, issue_status, created_by)
select p.id, 'Keyboard not working', 'Keys are not responding properly.', 'medium', 'open', pr.id
from public.pcs p
cross join public.profiles pr
join public.labs l on l.id = p.lab_id
where l.name = 'Lab A' and p.pc_number = 3 and pr.role = 'lab_assistant'
limit 1;

update public.pcs
set status = 'issue', notes = 'Keyboard not working'
where id in (
  select p.id from public.pcs p
  join public.labs l on l.id = p.lab_id
  where l.name = 'Lab A' and p.pc_number = 3
  limit 1
);

insert into public.lab_sessions (
  lab_id, session_date, day_name, start_time, end_time, teacher_name, class_name, topic,
  teacher_sign, cr_sign, assistant_sign, remarks, created_by
)
select l.id, current_date, 'Wednesday', '09:00', '10:00', 'Mr. Ahmed', 'BSCS-3A', 'MS Word Practical',
       'Ahmed', 'Ali', 'Saaad', 'All systems checked before class.', pr.id
from public.labs l
cross join public.profiles pr
where l.name = 'Lab A' and pr.role = 'lab_assistant'
limit 1;
