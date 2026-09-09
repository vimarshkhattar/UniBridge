import type { CampusEvent, SurvivalGuide } from "@/lib/types";

export const events: CampusEvent[] = [
  {
    id: "event-001",
    name: "International Student Welcome Circle",
    description: "Small-group introductions, campus tips, and a guided walk to key student services.",
    startsAt: "2026-08-24T15:00:00-04:00",
    location: "Student Activities Center",
    category: "International student orientation",
    organizer: "Sample International Student Team",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-002",
    name: "Campus Involvement Fair Meetup",
    description: "Find someone to walk through club tables with and compare organizations afterward.",
    startsAt: "2026-09-03T13:00:00-04:00",
    location: "Academic Mall",
    category: "Campus involvement fair",
    organizer: "Sample Student Life Group",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-003",
    name: "Resume Prep for International Students",
    description: "Workshop-style session covering US resume norms and campus career resources.",
    startsAt: "2026-09-10T17:30:00-04:00",
    location: "Career Center Workshop Room",
    category: "Career fair",
    organizer: "Sample Career Peer Mentors",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-004",
    name: "Cultural Club Sampler Night",
    description: "A relaxed evening to visit cultural club tables, taste snacks, and meet members.",
    startsAt: "2026-09-18T18:00:00-04:00",
    location: "SAC Ballroom",
    category: "Cultural club meeting",
    organizer: "Sample Multicultural Council",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-005",
    name: "Library Research Basics",
    description: "Learn how to search databases, request help, and cite sources for class projects.",
    startsAt: "2026-09-22T14:00:00-04:00",
    location: "Melville Library Instruction Lab",
    category: "Library workshop",
    organizer: "Sample Library Peer Guides",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-006",
    name: "Weekend Soccer Pickup",
    description: "Beginner-friendly pickup game for students who want exercise and easy conversation.",
    startsAt: "2026-09-26T10:00:00-04:00",
    location: "South P Lot Field",
    category: "Soccer game",
    organizer: "Sample Recreation Group",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-007",
    name: "Midterm Study Planning Clinic",
    description: "Build a realistic study plan, find classmates, and learn when to ask for academic help.",
    startsAt: "2026-10-07T16:00:00-04:00",
    location: "Central Reading Room",
    category: "Study workshop",
    organizer: "Sample Academic Success Team",
    sampleLabel: "Sample community-added event"
  },
  {
    id: "event-008",
    name: "Beginner Hackathon Team Finder",
    description: "Meet potential teammates before a weekend hackathon and discuss project ideas.",
    startsAt: "2026-10-16T18:30:00-04:00",
    location: "Computer Science Lobby",
    category: "Hackathon",
    organizer: "Sample Computing Society",
    sampleLabel: "Sample community-added event"
  }
];

export const guides: SurvivalGuide[] = [
  {
    id: "guide-001",
    title: "How office hours work",
    summary: "What office hours are, when to go, and how to prepare a useful question.",
    category: "Academics",
    readingTime: "5 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "What they are", body: "Office hours are scheduled times when instructors or TAs are available for student questions." },
      { heading: "How to prepare", body: "Bring the course name, assignment, what you tried, and the specific point where you got stuck." }
    ],
    examples: ["I tried problem 3 using the method from lecture, but I am confused about the boundary condition."],
    checklist: ["Check the syllabus", "Prepare one or two specific questions", "Arrive on time", "Take notes on next steps"]
  },
  {
    id: "guide-002",
    title: "How to email a professor",
    summary: "A simple structure for respectful, clear academic email.",
    category: "Communication",
    readingTime: "4 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Use context", body: "Include your course, section, and the reason for writing near the beginning." },
      { heading: "Be specific", body: "Ask one clear question or request one clear action." }
    ],
    examples: ["Subject: Question about CSE 532 project checkpoint"],
    checklist: ["Use a clear subject", "State your class", "Be polite and concise", "Review names and dates"]
  },
  {
    id: "guide-003",
    title: "Understanding a course syllabus",
    summary: "Where to find grading, deadlines, office hours, policies, and required materials.",
    category: "Academics",
    readingTime: "6 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Read early", body: "The syllabus is usually the first place to check for assignments, grading weights, and attendance expectations." },
      { heading: "Confirm changes", body: "Instructors may update details during the term, so also watch the course site and announcements." }
    ],
    examples: ["Put exam dates and major project deadlines into your calendar during week one."],
    checklist: ["Find grading weights", "Save office hours", "Check late policy", "Track exam dates"]
  },
  {
    id: "guide-004",
    title: "Understanding academic integrity",
    summary: "How to avoid accidental plagiarism, unauthorized collaboration, and citation problems.",
    category: "Academics",
    readingTime: "7 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Ask before collaborating", body: "Rules differ by class. If you are unsure whether help is allowed, ask the instructor or TA." },
      { heading: "Cite sources", body: "Give credit for ideas, text, code, data, and images that are not your own." }
    ],
    examples: ["It is safer to ask, 'Can we discuss the approach, or should we work completely separately?'"],
    checklist: ["Read course rules", "Cite sources", "Do your own submitted work", "Ask when unsure"],
    disclaimer: "Confirm official policies and consequences with your university or instructor."
  },
  {
    id: "guide-005",
    title: "Preparing for winter in New York",
    summary: "Practical clothing, commuting, and health tips for students new to cold weather.",
    category: "Campus life",
    readingTime: "5 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Dress in layers", body: "A warm coat, gloves, hat, and waterproof shoes make winter commutes more manageable." },
      { heading: "Plan travel time", body: "Snow and ice can slow buses, trains, walking routes, and parking." }
    ],
    examples: ["Keep a small umbrella or compact gloves in your bag during late fall."],
    checklist: ["Buy winter layers", "Check weather alerts", "Leave earlier", "Know indoor routes where possible"]
  },
  {
    id: "guide-006",
    title: "Speaking with an academic advisor",
    summary: "How to prepare questions about degree progress, requirements, and course choices.",
    category: "Stony Brook resources",
    readingTime: "5 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Bring your goal", body: "Tell the advisor whether you need help with registration, requirements, transfer credits, or graduation planning." },
      { heading: "Follow official guidance", body: "Advisors can point you to policies and offices that apply to your program." }
    ],
    examples: ["I am choosing between two courses. Which one better fits my degree progress this semester?"],
    checklist: ["Review your degree audit", "List questions", "Write down recommendations", "Confirm deadlines"],
    disclaimer: "For official Stony Brook policies, deadlines, visa questions, employment restrictions, and requirements, confirm with the relevant university office."
  },
  {
    id: "guide-007",
    title: "Finding tutoring",
    summary: "How to look for academic help before small confusion becomes a major problem.",
    category: "Academics",
    readingTime: "4 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Start early", body: "Tutoring, office hours, peer study, and review sessions work best before the exam week rush." },
      { heading: "Bring evidence", body: "Show your notes, assignment attempt, or practice question so helpers can see where you are stuck." }
    ],
    examples: ["I understand the lecture example, but I cannot start the homework version."],
    checklist: ["Check course resources", "Ask a TA", "Book tutoring if available", "Review after the session"]
  },
  {
    id: "guide-008",
    title: "Joining clubs and student organizations",
    summary: "Low-pressure ways to meet students beyond your classes.",
    category: "Campus life",
    readingTime: "4 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Try more than one", body: "It is normal to visit several clubs before choosing where you feel comfortable." },
      { heading: "Attend with a buddy", body: "Going with another student can make the first meeting feel easier." }
    ],
    examples: ["Message: Hi, I am new here. Is this meeting open to first-time visitors?"],
    checklist: ["Find meeting times", "Ask if visitors are welcome", "Attend once", "Follow up with someone you met"]
  },
  {
    id: "guide-009",
    title: "Applying for on-campus jobs",
    summary: "What to prepare before asking about student employment opportunities.",
    category: "Employment",
    readingTime: "6 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Know your eligibility", body: "International students should confirm employment rules before accepting work." },
      { heading: "Prepare documents", body: "Have a simple resume and your schedule ready when applying." }
    ],
    examples: ["Could you tell me whether this position is open to student applicants this semester?"],
    checklist: ["Confirm eligibility", "Prepare resume", "Check hours", "Ask official office when unsure"],
    disclaimer: "International employment rules can be strict. Confirm visa and work authorization questions with the official international student office."
  },
  {
    id: "guide-010",
    title: "What to expect during international student orientation",
    summary: "How to use orientation to meet people and understand important campus systems.",
    category: "Stony Brook resources",
    readingTime: "5 min",
    lastUpdated: "2026-07-01",
    sections: [
      { heading: "Expect lots of information", body: "Orientation often covers practical topics, campus resources, safety, and academic expectations." },
      { heading: "Make one connection", body: "You do not need to meet everyone. Aim for one conversation you can continue later." }
    ],
    examples: ["Want to exchange contact info and compare notes after the session?"],
    checklist: ["Bring ID if required", "Save important links", "Ask questions", "Follow up with one person"],
    disclaimer: "Confirm official orientation requirements and dates with Stony Brook or your university."
  }
];
