insert into public.universities (name, domain) values
('Stony Brook University', 'stonybrook.edu'),
('New York University', 'nyu.edu'),
('University at Buffalo', 'buffalo.edu')
on conflict (name) do nothing;

insert into public.interests (name) values
('Hackathons'), ('Badminton'), ('Cooking'), ('Career prep'), ('Soccer'), ('Volunteering'),
('Movies'), ('Board games'), ('Research'), ('Student clubs'), ('Photography'), ('American culture')
on conflict (name) do nothing;

insert into public.courses (university_id, code, title)
select u.id, c.code, c.title
from public.universities u
cross join (values
('CSE 532', 'Theory of Database Systems'),
('CSE 548', 'Analysis of Algorithms'),
('AMS 561', 'Applied Probability'),
('CSE 416', 'Software Engineering'),
('WRT 303', 'Writing for the Professions'),
('BME 304', 'Biomechanics'),
('ECO 303', 'Intermediate Microeconomics'),
('MAT 126', 'Calculus B'),
('SOC 247', 'Sociology of Gender'),
('HPH 501', 'Public Health Foundations')
) as c(code, title)
where u.name = 'Stony Brook University'
on conflict (university_id, code) do nothing;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
values
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya.iyer@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Maya Iyer"}', now(), now()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daniel.kim@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Daniel Kim"}', now(), now()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sofia.martinez@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Sofia Martinez"}', now(), now()),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chen.wei@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Chen Wei"}', now(), now()),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amina.hassan@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Amina Hassan"}', now(), now()),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucas.pereira@nyu.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Lucas Pereira"}', now(), now()),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nora.lind@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Nora Lind"}', now(), now()),
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'omar.alfayed@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Omar Al-Fayed"}', now(), now()),
('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.nair@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Priya Nair"}', now(), now()),
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kenji.tanaka@buffalo.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Kenji Tanaka"}', now(), now()),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leila.haddad@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Leila Haddad"}', now(), now()),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ravi.patel@stonybrook.edu', crypt('Password123!', gen_salt('bf')), now(), '{"full_name":"Ravi Patel"}', now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, university_id, full_name, email, major, academic_year, country, languages, preferred_activities, study_style, preferred_study_times, student_status, bio)
select p.id::uuid, u.id, p.full_name, p.email, p.major, p.year, p.country, p.languages, p.activities, p.study_style, p.study_times, p.status, p.bio
from (values
('00000000-0000-0000-0000-000000000001','Stony Brook University','Maya Iyer','maya.iyer@stonybrook.edu','Computer Science','Graduate','India',array['English','Hindi','Tamil'],array['Study sessions','Coffee chats','Campus events'],'Quiet focus with planned breaks',array['Evenings','Weekends'],'New student','New graduate student hoping to find study partners and attend more campus events.'),
('00000000-0000-0000-0000-000000000002','Stony Brook University','Daniel Kim','daniel.kim@stonybrook.edu','Computer Science','Senior','South Korea',array['English','Korean'],array['Study sessions','Campus events'],'Quiet focus with planned breaks',array['Evenings'],'Returning student','Returning student who likes helping newer international students.'),
('00000000-0000-0000-0000-000000000003','Stony Brook University','Sofia Martinez','sofia.martinez@stonybrook.edu','Biomedical Engineering','Junior','Mexico',array['English','Spanish'],array['Coffee chats','Campus events'],'Group review and practice problems',array['Afternoons'],'Returning student','Enjoys cultural events, volunteering, and presentations.'),
('00000000-0000-0000-0000-000000000004','Stony Brook University','Chen Wei','chen.wei@stonybrook.edu','Applied Mathematics','Graduate','China',array['English','Mandarin'],array['Study sessions','Gym'],'Quiet focus with planned breaks',array['Mornings','Weekends'],'New student','Looking for steady study partners and campus recreation.'),
('00000000-0000-0000-0000-000000000005','Stony Brook University','Amina Hassan','amina.hassan@stonybrook.edu','Economics','Sophomore','Egypt',array['English','Arabic'],array['Campus events','Coffee chats'],'Group review and practice problems',array['Evenings'],'Returning student','Likes club fairs, library study blocks, and conversation practice.'),
('00000000-0000-0000-0000-000000000006','New York University','Lucas Pereira','lucas.pereira@nyu.edu','Data Science','Graduate','Brazil',array['English','Portuguese','Spanish'],array['Campus events','Study sessions'],'Flexible, depends on the class',array['Weekends'],'New student','Interested in meeting students across New York campuses.'),
('00000000-0000-0000-0000-000000000007','Stony Brook University','Nora Lind','nora.lind@stonybrook.edu','Psychology','Exchange','Norway',array['English','Norwegian'],array['Campus events','Coffee chats'],'Short focused sessions',array['Afternoons','Weekends'],'New student','Exchange student hoping to attend events with a buddy.'),
('00000000-0000-0000-0000-000000000008','Stony Brook University','Omar Al-Fayed','omar.alfayed@stonybrook.edu','Mechanical Engineering','Junior','Jordan',array['English','Arabic'],array['Gym','Study sessions'],'Group review and practice problems',array['Mornings'],'Returning student','Likes structured study groups and weekend soccer.'),
('00000000-0000-0000-0000-000000000009','Stony Brook University','Priya Nair','priya.nair@stonybrook.edu','Business Management','First year','India',array['English','Malayalam','Hindi'],array['Campus events','Coffee chats'],'Short focused sessions',array['Evenings'],'New student','Looking for orientation buddies and club meetings.'),
('00000000-0000-0000-0000-000000000010','University at Buffalo','Kenji Tanaka','kenji.tanaka@buffalo.edu','Computer Science','Graduate','Japan',array['English','Japanese'],array['Study sessions'],'Quiet focus with planned breaks',array['Mornings','Weekends'],'Returning student','Interested in systems and data courses across SUNY.'),
('00000000-0000-0000-0000-000000000011','Stony Brook University','Leila Haddad','leila.haddad@stonybrook.edu','Public Health','Graduate','Lebanon',array['English','Arabic','French'],array['Coffee chats','Campus events'],'Flexible, depends on the class',array['Afternoons'],'New student','Looking for student services and low-pressure ways to meet people.'),
('00000000-0000-0000-0000-000000000012','Stony Brook University','Ravi Patel','ravi.patel@stonybrook.edu','Computer Science','Senior','United States',array['English','Gujarati'],array['Study sessions','Campus events'],'Quiet focus with planned breaks',array['Evenings'],'Returning student','Enjoys helping classmates navigate projects and recruiting.')
) as p(id, university_name, full_name, email, major, year, country, languages, activities, study_style, study_times, status, bio)
join public.universities u on u.name = p.university_name
on conflict (id) do update set full_name = excluded.full_name;

insert into public.events (name, description, starts_at, location, category, organizer, source_label) values
('International Student Welcome Circle', 'Small-group introductions, campus tips, and a guided walk to key student services.', '2026-08-24 15:00:00-04', 'Student Activities Center', 'International student orientation', 'Sample International Student Team', 'Sample community-added event'),
('Campus Involvement Fair Meetup', 'Find someone to walk through club tables with and compare organizations afterward.', '2026-09-03 13:00:00-04', 'Academic Mall', 'Campus involvement fair', 'Sample Student Life Group', 'Sample community-added event'),
('Resume Prep for International Students', 'Workshop-style session covering US resume norms and campus career resources.', '2026-09-10 17:30:00-04', 'Career Center Workshop Room', 'Career fair', 'Sample Career Peer Mentors', 'Sample community-added event'),
('Cultural Club Sampler Night', 'A relaxed evening to visit cultural club tables, taste snacks, and meet members.', '2026-09-18 18:00:00-04', 'SAC Ballroom', 'Cultural club meeting', 'Sample Multicultural Council', 'Sample community-added event'),
('Library Research Basics', 'Learn how to search databases, request help, and cite sources for class projects.', '2026-09-22 14:00:00-04', 'Melville Library Instruction Lab', 'Library workshop', 'Sample Library Peer Guides', 'Sample community-added event'),
('Weekend Soccer Pickup', 'Beginner-friendly pickup game for students who want exercise and easy conversation.', '2026-09-26 10:00:00-04', 'South P Lot Field', 'Soccer game', 'Sample Recreation Group', 'Sample community-added event'),
('Midterm Study Planning Clinic', 'Build a realistic study plan, find classmates, and learn when to ask for academic help.', '2026-10-07 16:00:00-04', 'Central Reading Room', 'Study workshop', 'Sample Academic Success Team', 'Sample community-added event'),
('Beginner Hackathon Team Finder', 'Meet potential teammates before a weekend hackathon and discuss project ideas.', '2026-10-16 18:30:00-04', 'Computer Science Lobby', 'Hackathon', 'Sample Computing Society', 'Sample community-added event');

insert into public.connection_requests (sender_id, receiver_id, message, status) values
('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Want to study for CSE 532 together this week?','pending'),
('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','We share AMS 561 and a quiet study style.','pending'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000009','Would you like to attend an orientation event together?','accepted')
on conflict (sender_id, receiver_id) do nothing;

insert into public.connections (user_a, user_b) values
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')
on conflict (user_a, user_b) do nothing;

insert into public.event_buddy_requests (event_id, user_id, note)
select e.id, p.id::uuid, 'I would like to attend with a small group.'
from public.events e
cross join (values
('00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000007')
) as p(id)
where e.name in ('International Student Welcome Circle', 'Campus Involvement Fair Meetup')
on conflict (event_id, user_id) do nothing;

insert into public.survival_guides (title, summary, category, reading_time, content, last_updated) values
('How office hours work', 'What office hours are, when to go, and how to prepare a useful question.', 'Academics', '5 min', '{"sections":[{"heading":"What they are","body":"Scheduled times for student questions."}],"checklist":["Check the syllabus","Prepare specific questions"]}', '2026-07-01'),
('How to email a professor', 'A simple structure for respectful, clear academic email.', 'Communication', '4 min', '{"sections":[{"heading":"Use context","body":"Include course and section."}],"checklist":["Clear subject","Review facts"]}', '2026-07-01'),
('Understanding a course syllabus', 'Where to find grading, deadlines, office hours, policies, and required materials.', 'Academics', '6 min', '{"sections":[],"checklist":["Find grading weights","Track exam dates"]}', '2026-07-01'),
('How grading commonly works', 'Common grading language and why each course may differ.', 'Academics', '5 min', '{"sections":[],"checklist":["Read syllabus","Ask instructor"]}', '2026-07-01'),
('Participating in class', 'Ways to join discussion when classroom norms feel unfamiliar.', 'American culture', '4 min', '{"sections":[],"checklist":["Prepare one comment","Ask after class"]}', '2026-07-01'),
('Working on group projects', 'How to set roles, timelines, and respectful expectations.', 'Communication', '5 min', '{"sections":[],"checklist":["Agree on tasks","Document decisions"]}', '2026-07-01'),
('Using the university library', 'How to use research databases, study rooms, and librarian support.', 'Stony Brook resources', '5 min', '{"sections":[],"checklist":["Search databases","Ask a librarian"]}', '2026-07-01'),
('Applying for on-campus jobs', 'What to prepare before asking about student employment opportunities.', 'Employment', '6 min', '{"sections":[],"checklist":["Confirm eligibility","Prepare resume"]}', '2026-07-01'),
('Getting around the Stony Brook campus', 'Practical navigation and transport habits for a large campus.', 'Transportation', '4 min', '{"sections":[],"checklist":["Check routes","Leave extra time"]}', '2026-07-01'),
('What to expect during international student orientation', 'How to use orientation to meet people and understand important campus systems.', 'Stony Brook resources', '5 min', '{"sections":[],"checklist":["Save links","Follow up"]}', '2026-07-01');
