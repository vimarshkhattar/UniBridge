import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, MessageSquareText, ShieldCheck, UsersRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: UsersRound, title: "Compatible student matches", text: "Find study partners, friends, event buddies, language practice partners, and same-country connections." },
  { icon: CalendarDays, title: "Campus event buddies", text: "Browse sample Stony Brook launch events and join small groups so you do not have to attend alone." },
  { icon: MessageSquareText, title: "Communication helper", text: "Draft respectful emails, text messages, group-project notes, and conversation outlines with cultural context." },
  { icon: BookOpen, title: "Survival guides", text: "Search practical guides for office hours, syllabi, academic integrity, campus life, jobs, and winter in New York." }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="focus-ring rounded-sm hover:text-navy" href="#features">Features</a>
            <a className="focus-ring rounded-sm hover:text-navy" href="#how">How it works</a>
            <a className="focus-ring rounded-sm hover:text-navy" href="#safety">Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="focus-ring hidden rounded-md px-3 py-2 text-sm font-semibold text-navy hover:bg-muted sm:inline-flex">
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button>
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Join UniBridge</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-800">
              Stony Brook launch for international students
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-normal text-navy sm:text-6xl">
              Connect. Belong. Succeed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              UniBridge helps international students find compatible friends, study partners, event buddies, and practical guidance for navigating university life.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up">
                <Button className="w-full sm:w-auto">
                  Join UniBridge <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" className="w-full sm:w-auto">Explore Features</Button>
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted p-5 shadow-sm">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today&apos;s bridge</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between rounded-md bg-red-50 p-4">
                    <div>
                      <p className="font-semibold text-navy">Daniel Kim</p>
                      <p className="text-sm text-muted-foreground">CSE 532, AMS 561, quiet study style</p>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">91%</span>
                  </div>
                  <div className="rounded-md border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-navy">Campus Involvement Fair Meetup</p>
                    <p className="mt-1 text-sm text-muted-foreground">34 students are looking for an event buddy.</p>
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Sample launch data. Official policies and deadlines should always be confirmed with the relevant university office.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-navy">One place for the awkward first steps</h2>
          <p className="mt-3 text-muted-foreground">
            UniBridge focuses on the moments international students often face alone: the first study group, the first office-hour visit, the first event, and the first tricky message.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-6 text-primary" aria-hidden />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {["Create your profile", "Find a bridge", "Show up with confidence"].map((step, index) => (
            <div key={step}>
              <span className="grid size-10 place-items-center rounded-md bg-navy font-bold text-white">{index + 1}</span>
              <h3 className="mt-4 text-xl font-bold text-navy">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {index === 0 && "Share your university, courses, interests, languages, study style, and connection preferences."}
                {index === 1 && "Use transparent match scores, event buddy groups, and survival guides to choose the next practical step."}
                {index === 2 && "Use the assistant and safety reminders before meeting people or sending important university messages."}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Stony Brook Launch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Initial sample content highlights Stony Brook-style student needs: orientation, academic support, campus involvement, library workshops, career preparation, and winter adjustment.
            </p>
            <p>
              UniBridge is not affiliated with or endorsed by Stony Brook University. Stony Brook-specific guidance is labeled carefully and should be confirmed with official offices.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sample Testimonials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-4 border-accent pl-4 text-sm text-muted-foreground">
              “I found someone from my course before the first project meeting.” <span className="font-semibold text-navy">Sample student quote</span>
            </blockquote>
            <blockquote className="border-l-4 border-primary pl-4 text-sm text-muted-foreground">
              “The email assistant helped me sound respectful without sounding too stiff.” <span className="font-semibold text-navy">Sample student quote</span>
            </blockquote>
          </CardContent>
        </Card>
      </section>

      <section id="safety" className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 size-7 text-primary" aria-hidden />
            <div>
              <h2 className="text-3xl font-bold text-navy">Safety and privacy are part of the product</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Meet new people in public campus locations, avoid sharing sensitive personal or financial information, report suspicious behavior, and independently verify housing, rides, or marketplace-style arrangements. Marketplace features are intentionally outside this launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-navy">Frequently Asked Questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Is UniBridge only for Stony Brook?", "No. UniBridge launches with Stony Brook-oriented sample content, but the schema and profile model support any university."],
            ["Is the verified badge official?", "No. It only means the email domain matches @stonybrook.edu. It is not an endorsement or official university verification."],
            ["Does the communication helper know university rules?", "No. It helps with communication style and structure. Students should confirm policies, deadlines, visa issues, and requirements with official offices."],
            ["Can I hide profile details?", "Yes. Profile privacy controls are part of the protected app experience."]
          ].map(([question, answer]) => (
            <Card key={question}>
              <CardHeader>
                <CardTitle>{question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-bold">UniBridge</p>
            <p className="text-sm text-red-100">Connect. Belong. Succeed.</p>
          </div>
          <div className="flex gap-4 text-sm text-red-100">
            <Link href="/guidelines">Community guidelines</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
