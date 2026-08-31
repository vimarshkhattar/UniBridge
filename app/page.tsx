import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  MessageSquareText,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  {
    title: "Compatibility-first discovery",
    description:
      "Students can compare courses, interests, languages, academic goals, study rhythm, and campus preferences before starting a conversation.",
    icon: Compass
  },
  {
    title: "Connection requests that feel clear",
    description:
      "Send, receive, accept, decline, save, and revisit student profiles with states that explain exactly what happened.",
    icon: UsersRound
  },
  {
    title: "Event buddies and small groups",
    description:
      "Join campus events, ask for a buddy, create a small group, or join an existing group with shared expectations.",
    icon: CalendarDays
  },
  {
    title: "Practical campus guides",
    description:
      "Read short, plain-language guides for classroom norms, group work, library resources, jobs, and orientation moments.",
    icon: BookOpen
  },
  {
    title: "Communication helper",
    description:
      "Draft respectful messages for professors, classmates, staff, roommates, and other university situations.",
    icon: MessageSquareText
  },
  {
    title: "Safer student experience",
    description:
      "University context, profile visibility controls, report flows, and privacy-minded defaults keep the product focused.",
    icon: ShieldCheck
  }
];

const steps = [
  {
    title: "Build your student profile",
    description: "Add your major, courses, languages, interests, study style, and a photo so classmates understand your context."
  },
  {
    title: "Find useful matches",
    description: "Browse students by shared classes, goals, university, preferred activities, and connection type."
  },
  {
    title: "Move from awkward to easy",
    description: "Send a request, join an event buddy group, message accepted connections, and keep campus plans organized."
  }
];

const signals = [
  { label: "Shared courses", value: "CSE 532, AMS 561" },
  { label: "Study style", value: "Quiet focus with planned breaks" },
  { label: "Looking for", value: "Study partner, event buddy" }
];

export default function LandingPage() {
  return (
    <main className="mesh-glow min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-black text-muted-foreground md:flex" aria-label="Landing navigation">
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-white" href="#safety">
              Safety
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="focus-ring hidden rounded-2xl px-4 py-2 text-sm font-black text-foreground transition hover:bg-white/[0.07] sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="focus-ring inline-flex items-center justify-center rounded-2xl bg-brand-gradient px-5 py-2.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Join
            </Link>
          </div>
        </div>
      </header>

      <section className="grid-backdrop relative">
        <div className="noise-overlay" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
          <div className="animate-rise flex flex-col justify-center">
            <p className="mb-6 w-fit rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
              Stony Brook launch for international students
            </p>
            <h1 className="font-display max-w-3xl text-5xl font-black leading-[1.03] text-foreground sm:text-6xl lg:text-7xl">
              Find your people before campus feels big.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              UniBridge helps international university students create a real profile, discover compatible classmates,
              send connection requests, find event buddies, join small groups, and start conversations with more confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3 text-base font-black text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Join UniBridge <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#features"
                className="focus-ring inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-3 text-base font-black text-white transition hover:bg-white/[0.1]"
              >
                Explore features
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["88%", "match clarity"],
                ["3 steps", "to connect"],
                ["Live", "student messages"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-rise rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-lift backdrop-blur-xl sm:p-6">
            <div className="card-surface relative overflow-hidden p-6">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Bridge signal</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Vimarsh Khattar</h2>
                  <p className="text-sm font-semibold text-muted-foreground">Computer Science · Stony Brook University</p>
                </div>
                <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-black text-white shadow-glow">91%</span>
              </div>

              <div className="relative mt-6 grid gap-3">
                {signals.map((signal) => (
                  <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{signal.label}</p>
                    <p className="mt-2 font-black text-white">{signal.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 rounded-2xl border border-primary/25 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm font-semibold leading-6 text-primary-foreground">
                    Suggested opener: “Hi Vimarsh, I noticed we share CSE 532. Want to compare study plans before class starts?”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">One place for first steps</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              A calmer way to discover people, plans, and support.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              UniBridge is designed around the moments that can feel unclear at a new university: finding someone from class,
              attending your first event, asking for help, and sending the right message.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="interactive-card card-surface p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <feature.icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">From profile to real conversation.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The product keeps the path simple so students always know what to do next.
            </p>
          </div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="interactive-card card-surface flex gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-sm font-black text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="border-y border-white/10 bg-soft-gradient">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="card-surface grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Safety and trust</p>
              <h2 className="mt-3 text-3xl font-black text-white">Helpful, clear, and student-controlled.</h2>
            </div>
            <div className="grid gap-4">
              {[
                "Students control profile visibility and what details are shown.",
                "Connection requests create consent before direct messaging starts.",
                "Campus guidance is practical support, not official university policy."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-mint" aria-hidden />
                  <p className="font-semibold leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-brand-gradient px-6 py-10 text-white shadow-glow sm:px-10">
          <Radar className="absolute -right-8 -top-8 size-44 text-white/10" aria-hidden />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/75">
                <GraduationCap className="size-5" aria-hidden />
                UniBridge
              </div>
              <h2 className="text-3xl font-black">Ready to make campus feel smaller?</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/85">
                Create your student profile, discover compatible classmates, and turn first messages into real campus plans.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-black text-primary transition hover:bg-primary-soft"
            >
              Get started <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo compact />
          <p>UniBridge 2026. Built for student connection and campus belonging.</p>
        </div>
      </footer>
    </main>
  );
}
