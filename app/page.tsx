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
      "Compare courses, interests, languages, academic goals, study rhythm, and campus preferences before starting a conversation.",
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
      "Join campus events, ask for a buddy, create a small group, or join an existing one with shared expectations.",
    icon: CalendarDays
  },
  {
    title: "Practical campus guides",
    description:
      "Short, plain-language guides for classroom norms, group work, library resources, jobs, and orientation moments.",
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
    description:
      "Add your major, courses, languages, interests, study style, and a photo so classmates understand your context."
  },
  {
    title: "Find useful matches",
    description: "Browse students by shared classes, goals, university, preferred activities, and connection type."
  },
  {
    title: "Move from awkward to easy",
    description:
      "Send a request, join an event buddy group, message accepted connections, and keep campus plans organized."
  }
];

const signals = [
  { label: "Shared courses", value: "The classes you already have in common" },
  { label: "Study style", value: "How and when each of you likes to work" },
  { label: "Looking for", value: "Study partner, event buddy, or friend" }
];

const audience = [
  ["New students", "arriving for the first time"],
  ["Transfer students", "starting over mid-degree"],
  ["3 steps", "from profile to conversation"]
];

export default function LandingPage() {
  return (
    <main className="mesh-glow min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-muted-foreground md:flex" aria-label="Landing navigation">
            <a className="transition hover:text-foreground" href="#features">Features</a>
            <a className="transition hover:text-foreground" href="#how-it-works">How it works</a>
            <a className="transition hover:text-foreground" href="#safety">Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="focus-ring press-3d hidden rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-white/[0.07] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="focus-ring press-3d inline-flex items-center justify-center rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------- hero */}
      <section className="grid-backdrop depth-scene relative">
        <div className="noise-overlay" aria-hidden />
        <div className="depth-field" aria-hidden>
          <span className="animate-pulse-glow left-[6%] top-[4%] size-80" />
          <span className="animate-pulse-glow right-[2%] top-[30%] size-96 [animation-delay:2s]" />
          <span className="animate-pulse-glow bottom-0 left-[40%] size-72 [animation-delay:4s]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="animate-rise flex flex-col justify-center">
            <p className="mb-6 w-fit rounded-full border border-[rgba(225,29,46,0.3)] bg-[var(--red-soft)] px-4 py-2 text-sm font-bold text-[var(--red-bright)]">
              Stony Brook launch for new and transfer students
            </p>
            <h1 className="font-display max-w-3xl text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Find your people before campus feels big.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              UniBridge is for all new college students and transfer students who face problems when coming to a new
              university. Create a real profile, discover compatible classmates, send connection requests, find event
              buddies, join small groups, and start conversations with more confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="focus-ring press-3d inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-base font-bold text-white shadow-glow"
              >
                Join UniBridge <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#features"
                className="focus-ring press-3d inline-flex items-center justify-center rounded-full border border-border bg-white/[0.05] px-6 py-3.5 text-base font-bold text-foreground transition hover:bg-white/[0.09]"
              >
                Explore features
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {audience.map(([value, label]) => (
                <div key={label} className="tilt-card rounded-2xl border border-border bg-white/[0.035] p-4">
                  <p className="text-lg font-black text-foreground">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Layered match preview. Illustrative, not a real person. */}
          <div className="depth-scene-near animate-rise relative flex items-center justify-center">
            <div className="animate-drift preserve-3d relative w-full">
              <div
                className="absolute inset-x-6 top-8 h-full rounded-[2rem] border border-border bg-white/[0.02]"
                style={{ transform: "translateZ(-70px) rotateX(4deg) scale(0.95)" }}
                aria-hidden
              />
              <div
                className="absolute inset-x-3 top-4 h-full rounded-[2rem] border border-[rgba(225,29,46,0.15)] bg-[rgba(225,29,46,0.05)]"
                style={{ transform: "translateZ(-35px) rotateX(2deg) scale(0.975)" }}
                aria-hidden
              />

              <div className="tilt-card card-surface preserve-3d relative overflow-hidden p-6 sm:p-7">
                <div className="animate-pulse-glow absolute right-0 top-0 size-44 rounded-full bg-[var(--red)] opacity-25 blur-3xl" aria-hidden />

                <div className="layer-front relative flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Bridge signal</p>
                    <h2 className="mt-2 text-2xl font-black">How a match reads</h2>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">What you see before you reach out</p>
                  </div>
                  <span className="animate-bob grid size-12 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
                    <Compass className="size-5" aria-hidden />
                  </span>
                </div>

                <div className="layer-mid relative mt-6 grid gap-3">
                  {signals.map((signal) => (
                    <div key={signal.label} className="rounded-2xl border border-border bg-white/[0.045] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{signal.label}</p>
                      <p className="mt-2 font-bold text-foreground">{signal.value}</p>
                    </div>
                  ))}
                </div>

                <div className="layer-front relative mt-6 rounded-2xl border border-[rgba(225,29,46,0.28)] bg-[var(--red-soft)] p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-[var(--red-bright)]" aria-hidden />
                    <p className="text-sm font-medium leading-6 text-[#ffd3d7]">
                      Every score is explained, so you always know why someone was suggested before you send a message.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section id="features" className="depth-scene border-y border-border bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="reveal-3d max-w-3xl">
            <p className="eyebrow">One place for first steps</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">A calmer way to discover people, plans, and support.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              UniBridge is designed around the moments that can feel unclear at a new university: finding someone from
              class, attending your first event, asking for help, and sending the right message.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="reveal-3d tilt-card card-surface preserve-3d p-6">
                <span className="layer-mid grid size-12 place-items-center rounded-2xl bg-[var(--red-soft)] text-[var(--red-bright)]">
                  <feature.icon className="size-6" aria-hidden />
                </span>
                <h3 className="layer-mid mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section id="how-it-works" className="depth-scene mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="reveal-3d">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">From profile to real conversation.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The product keeps the path simple so students always know what to do next.
            </p>
          </div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="reveal-3d tilt-card card-surface preserve-3d flex gap-4 p-5">
                <span className="layer-front grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--red-soft)] text-sm font-black text-[var(--red-bright)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ safety */}
      <section id="safety" className="depth-scene border-y border-border bg-soft-gradient">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="reveal-3d tilt-card card-surface grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Safety and trust</p>
              <h2 className="mt-3 text-3xl font-black">Helpful, clear, and student-controlled.</h2>
            </div>
            <div className="grid gap-4">
              {[
                "Students control profile visibility and what details are shown.",
                "Connection requests create consent before direct messaging starts.",
                "Campus guidance is practical support, not official university policy."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-mint" aria-hidden />
                  <p className="font-medium leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- cta */}
      <section className="depth-scene mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="reveal-3d tilt-card preserve-3d relative overflow-hidden rounded-[2rem] border border-[rgba(225,29,46,0.3)] bg-brand-gradient px-6 py-12 text-white shadow-glow sm:px-10">
          <Radar className="animate-orbit absolute -right-8 -top-8 size-44 text-white/10" aria-hidden />
          <div className="layer-mid relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white/75">
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
              className="focus-ring press-3d inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-[var(--red)] transition hover:bg-[#ffe9eb]"
            >
              Get started <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo compact />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link className="transition hover:text-foreground" href="/guidelines">Guidelines</Link>
            <Link className="transition hover:text-foreground" href="/privacy">Privacy</Link>
            <Link className="transition hover:text-foreground" href="/terms">Terms</Link>
          </div>
          <p>UniBridge 2026. Built for student connection and campus belonging.</p>
        </div>
      </footer>
    </main>
  );
}
