// src\pages\Home.jsx
import { Link } from "react-router-dom";
import {
  FolderKanban,
  HardHat,
  ReceiptText,
  LifeBuoy,
  ListTodo,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Track projects, statements, owner projects, and reports in one place.",
  },
  {
    icon: HardHat,
    title: "Worker & Attendance",
    description:
      "Manage worker records, pay rates, and attendance tracking across sites.",
  },
  {
    icon: ReceiptText,
    title: "Invoicing",
    description: "Create, edit, and manage invoices tied to your projects.",
  },
  {
    icon: LifeBuoy,
    title: "Support Ticketing",
    description:
      "Raise change requests, variations, and special notes with a full comment and attachment thread.",
  },
  {
    icon: ListTodo,
    title: "Task Board",
    description:
      "A kanban-style todo board with priorities for team task tracking.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Stay updated in real time on ticket activity and assignments.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-[17px] font-bold tracking-tight text-foreground select-none"
          >
            7Skies Riversoft
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-xl"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <main>
        <section className="relative overflow-hidden">
          {/* background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-[-180px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[100px] dark:bg-primary/[0.10] dark:blur-[120px]" />
            <div className="absolute left-[20%] top-[40px] h-[260px] w-[260px] rounded-full bg-accent/50 blur-[80px] dark:bg-accent/20" />
            <div className="absolute right-[15%] top-[80px] h-[220px] w-[220px] rounded-full bg-primary/[0.04] blur-[90px] dark:bg-primary/[0.07]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 md:pt-36 pb-16 sm:pb-20">
            <div className="text-center max-w-[680px] mx-auto">
              <p className="text-overline text-muted-foreground tracking-widest mb-5 sm:mb-6">
                By Nexirion Tech
              </p>

              <h1 className="text-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight text-foreground mb-6 sm:mb-7">
                Construction project management,
                <br className="hidden sm:block" />
                <span className="text-primary">
                  from groundbreaking to final invoice
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
                7Skies Riversoft keeps construction project teams aligned —
                track projects, manage worker attendance, raise invoices, resolve
                tickets, and run your task board, all in one place.
              </p>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center h-11 px-8 rounded-sm bg-primary text-primary-foreground text-sm sm:text-[15px] font-medium transition-all duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-xl"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ─────────────────────────────────────── */}
        <section aria-label="Platform modules">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* section heading */}
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                Everything a construction team needs
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Six connected modules covering the full lifecycle of your
                projects — from planning and labor to billing and support.
              </p>
            </div>

            {/* grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group relative bg-card border border-border rounded-lg p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20"
                >
                  <div className="w-11 h-11 rounded-sm bg-accent/60 dark:bg-accent/40 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-accent">
                    <Icon
                      className="w-[22px] h-[22px] text-primary transition-colors duration-300"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="text-[17px] font-semibold tracking-tight text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-display text-sm font-bold tracking-tight text-foreground select-none">
            7Skies Riversoft
          </span>
          <span className="text-caption text-muted-foreground">
            Built by Nexirion Tech · Access is provisioned internally
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
