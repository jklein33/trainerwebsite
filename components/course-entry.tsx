import Link from "next/link";
import { ArrowUpRight, BookOpen, FileText, Play } from "lucide-react";
import { courseHref } from "@/lib/courses/links";

export function CourseEntry() {
  return (
    <section
      aria-labelledby="course-room-heading"
      className="border-y border-white/10 bg-zinc-950 px-6 py-16 lg:px-12 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-orange-400">
            THE DAWG STRENGTH COURSE ROOM
          </p>
          <h2
            id="course-room-heading"
            className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            Your next lesson.
            <br />
            Your own pace.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-300">
            Keep your lessons, videos, and course resources in one place. Sign
            in to explore the course room and access the courses you own.
          </p>
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Link
              href={courseHref()}
              className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
            >
              Sign in to your courses <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <Link
              href={courseHref("/register")}
              className="py-2 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:text-orange-400"
            >
              New here? Create an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Course purchases are separate from account registration.
          </p>
        </div>
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black px-6 sm:px-8">
          {[
            {
              icon: BookOpen,
              title: "A clear course structure",
              description: "Find your way through modules and lessons.",
            },
            {
              icon: Play,
              title: "Video lessons, ready when you are",
              description:
                "Open your course on your phone, tablet, or computer.",
            },
            {
              icon: FileText,
              title: "Resources alongside each lesson",
              description:
                "Keep the supporting notes and downloads close at hand.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 py-6">
              <Icon
                className="mt-1 shrink-0 text-orange-400"
                size={22}
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MemberCourseLink() {
  return (
    <p className="text-sm text-gray-300">
      Already enrolled?{" "}
      <Link
        href={courseHref()}
        className="font-medium text-orange-400 underline underline-offset-4 hover:text-orange-300"
      >
        Sign in to your courses
      </Link>
    </p>
  );
}
