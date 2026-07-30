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

-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


insert into public.events (name, description, starts_at, location, category, organizer, source_label) values
('International Student Welcome Circle', 'Small-group introductions, campus tips, and a guided walk to key student services.', '2026-08-24 15:00:00-04', 'Student Activities Center', 'International student orientation', 'Sample International Student Team', 'Sample community-added event'),
('Campus Involvement Fair Meetup', 'Find someone to walk through club tables with and compare organizations afterward.', '2026-09-03 13:00:00-04', 'Academic Mall', 'Campus involvement fair', 'Sample Student Life Group', 'Sample community-added event'),
('Resume Prep for International Students', 'Workshop-style session covering US resume norms and campus career resources.', '2026-09-10 17:30:00-04', 'Career Center Workshop Room', 'Career fair', 'Sample Career Peer Mentors', 'Sample community-added event'),
('Cultural Club Sampler Night', 'A relaxed evening to visit cultural club tables, taste snacks, and meet members.', '2026-09-18 18:00:00-04', 'SAC Ballroom', 'Cultural club meeting', 'Sample Multicultural Council', 'Sample community-added event'),
('Library Research Basics', 'Learn how to search databases, request help, and cite sources for class projects.', '2026-09-22 14:00:00-04', 'Melville Library Instruction Lab', 'Library workshop', 'Sample Library Peer Guides', 'Sample community-added event'),
('Weekend Soccer Pickup', 'Beginner-friendly pickup game for students who want exercise and easy conversation.', '2026-09-26 10:00:00-04', 'South P Lot Field', 'Soccer game', 'Sample Recreation Group', 'Sample community-added event'),
('Midterm Study Planning Clinic', 'Build a realistic study plan, find classmates, and learn when to ask for academic help.', '2026-10-07 16:00:00-04', 'Central Reading Room', 'Study workshop', 'Sample Academic Success Team', 'Sample community-added event'),
('Beginner Hackathon Team Finder', 'Meet potential teammates before a weekend hackathon and discuss project ideas.', '2026-10-16 18:30:00-04', 'Computer Science Lobby', 'Hackathon', 'Sample Computing Society', 'Sample community-added event');

-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


-- Demo user/profile seed data removed. Real users now create profiles through sign-up and onboarding.


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
