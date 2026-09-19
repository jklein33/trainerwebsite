"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  FileText,
  Pencil,
  Play,
  Plus,
  UploadCloud,
} from "lucide-react";
import { ModuleMap } from "./module-map";
import { RichText } from "./rich-text";
import { DescriptionEditor } from "./editor";
import type { Module, RichNode } from "@/lib/courses/types";

// Fictional content for the development-only /preview route. No API clients or real records.
const courses = [
  {
    title: "The Strength Foundation",
    summary:
      "Build a stronger foundation, one lesson at a time. Learn the principles behind confident, consistent training.",
    image:
      "/images/The-Shop-Gym-Manassas-Thumbnail-rfnftcpbg5trizwuo2j31gt1fqgotqa7s9yspym148.jpg",
    status: "published",
  },
  {
    title: "Train with Intention",
    summary:
      "Bring structure to your week. Understand how to approach each session and make the most of your time in the gym.",
    image: "/images/ambitious-studio-rick-barrett-aw9cszR7FGU-unsplash.jpg",
    status: "published",
  },
  {
    title: "Your Next Chapter",
    summary:
      "An upcoming course, still taking shape. Draft content stays in the admin area until it is ready to share.",
    image: "/images/ambitious-studio-rick-barrett-1RNQ11ZODJM-unsplash.jpg",
    status: "draft",
  },
];
const curriculum = [
  {
    title: "Start with the fundamentals",
    lessons: [
      "Welcome to your course",
      "Build your training routine",
      "Getting ready for your first session",
    ],
  },
  {
    title: "Learn the movements",
    lessons: [
      "The squat: a closer look",
      "Understand the hip hinge",
      "Push, pull and carry",
    ],
  },
  {
    title: "Put it into practice",
    lessons: [
      "Your weekly training plan",
      "Keep a useful training log",
      "Adjust your next session",
    ],
  },
  {
    title: "Keep moving forward",
    lessons: [
      "Review your progress",
      "Build consistency",
      "Plan your next chapter",
    ],
  },
];
const initialNotes: RichNode = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Welcome to your course room. Each module brings together short lessons, practical notes and resources you can come back to whenever you need them.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "In this lesson" }],
    },
    {
      type: "bulletList",
      content: [
        "Find your way around the course and its modules.",
        "Download the lesson resources for your notes.",
        "Choose a regular time to work through your next lesson.",
      ].map((text) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
      })),
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This lesson text is sample content for the local preview.",
          marks: [{ type: "italic" }],
        },
      ],
    },
  ],
};
const people = [
  {
    name: "Gaku",
    email: "gaku@example.invalid",
    source: "purchase",
    active: true,
  },
  {
    name: "Sam Taylor",
    email: "sam@example.invalid",
    source: "migration",
    active: true,
  },
  {
    name: "Jordan Lee",
    email: "jordan@example.invalid",
    source: "manual",
    active: false,
  },
];

export function LocalCoursePreview({
  view = "courses",
  courseIndex,
  lessonIndex,
}: {
  view?: string;
  courseIndex: number;
  lessonIndex: number;
}) {
  const selected =
    Number.isInteger(courseIndex) &&
    courseIndex >= 0 &&
    courseIndex < courses.length
      ? courseIndex
      : 0;
  const course = courses[selected];
  const lessons = curriculum.flatMap((m, mi) =>
    m.lessons.map((title) => ({ title, moduleIndex: mi })),
  );
  const lessonNumber =
    Number.isInteger(lessonIndex) &&
    lessonIndex >= 0 &&
    lessonIndex < lessons.length
      ? lessonIndex
      : 0;
  const lesson = lessons[lessonNumber];
  const admin = ["admin", "manage", "members"].includes(view);
  const [editing, setEditing] = useState<number | null>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [notice, setNotice] = useState("");
  const [memberIndex, setMemberIndex] = useState(0);
  const member = people[memberIndex];
  const url = (nextView: string, nextCourse = selected, nextLesson = 0) =>
    `/preview?view=${nextView}&course=${nextCourse}&lesson=${nextLesson}`;
  const info = () =>
    setNotice("Preview only. Files, payments and member details are not changed.");
  const modules: Module[] = curriculum.map((m, i) => ({
    id: `sample-${i}`,
    course_id: "sample",
    title: m.title,
    status: "published",
    position: i,
    created_at: "2026-09-01T00:00:00Z",
  }));
  const back = (label: string, target: string) => (
    <Link className="academy-back" href={url(target)}>
      <ArrowLeft size={15} /> {label}
    </Link>
  );

  return (
    <div className="academy">
      <div className="preview-banner">
        <strong>LOCAL PREVIEW</strong>
        <span>Sample data · No sign-in or purchase required</span>
        <Link href="/login">Back to sign in</Link>
      </div>
      <header className="academy-nav preview-nav">
        <Link href={url("courses")} className="academy-brand">
          DAWG<span>STRENGTH</span>
          <small>THE COURSE ROOM</small>
        </Link>
        <nav>
          <Link
            className={!admin ? "preview-active" : ""}
            href={url("courses")}
          >
            Learner view
          </Link>
          <Link className={admin ? "preview-active" : ""} href={url("admin")}>
            Admin view
          </Link>
          <span className="academy-pill">
            {admin ? "Demo admin" : "Gaku · Demo member"}
          </span>
        </nav>
      </header>
      <div className="academy-container">
        <nav className="academy-subnav" aria-label="Preview screens">
          {(admin
            ? [
                ["admin", "Courses"],
                ["manage", "Curriculum & media"],
                ["members", "Members & access"],
              ]
            : [
                ["courses", "My courses"],
                ["course", "Course overview"],
                ["lesson", "Lesson room"],
              ]
          ).map(([key, label]) => (
            <Link
              key={key}
              className={view === key ? "active" : ""}
              href={url(key)}
            >
              {label}
            </Link>
          ))}
        </nav>
        {notice && (
          <p className="academy-notice" role="status">
            {notice}
          </p>
        )}
        <main>
          {view === "courses" ||
          !["course", "lesson", "admin", "manage", "members"].includes(view) ? (
            <>
              <div className="academy-page-heading">
                <div>
                  <span className="academy-eyebrow">YOUR COURSE ROOM</span>
                  <h1>Show up. Build forward.</h1>
                  <p className="academy-muted">
                    Gaku, your next session starts with one lesson.
                  </p>
                </div>
                <span className="academy-count">
                  <BookOpen size={17} />2 courses
                </span>
              </div>
              <div className="academy-course-grid">
                {courses
                  .filter((c) => c.status === "published")
                  .map((item, i) => (
                    <Link
                      className="academy-course-card"
                      href={url("course", i)}
                      key={item.title}
                    >
                      <div className="academy-card-image">
                        <Image
                          src={item.image}
                          alt="Training space"
                          width={800}
                          height={500}
                        />
                        <span className="academy-number">0{i + 1}</span>
                        <span className="academy-pill">Your course</span>
                      </div>
                      <div className="academy-card-body">
                        <h2>{item.title}</h2>
                        <p>{item.summary}</p>
                        <div className="academy-card-action">
                          Enter course
                          <ArrowUpRight size={20} />
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          ) : null}

          {view === "course" && (
            <>
              {back("All courses", "courses")}
              <section className="academy-course-hero">
                <div>
                  <span className="academy-eyebrow">
                    DAWG STRENGTH / COURSE
                  </span>
                  <h1>{course.title}</h1>
                  <p>{course.summary}</p>
                  <span className="academy-pill">Your access is active</span>
                </div>
                <Image
                  src={course.image}
                  alt="Course training space"
                  width={800}
                  height={500}
                />
              </section>
              <div className="academy-section-heading">
                <h2>Your curriculum</h2>
                <span>4 modules · 12 lessons</span>
              </div>
              <ModuleMap modules={modules} />
              <div className="academy-modules">
                {curriculum.map((m, mi) => (
                  <section
                    id={`module-sample-${mi}`}
                    className="academy-module"
                    key={m.title}
                  >
                    <div className="academy-module-heading">
                      <span>0{mi + 1}</span>
                      <h3>{m.title}</h3>
                    </div>
                    {m.lessons.map((title, li) => (
                      <Link
                        className="academy-lesson-link"
                        href={url("lesson", selected, mi * 3 + li)}
                        key={title}
                      >
                        <span>0{li + 1}</span>
                        <strong>{title}</strong>
                        <Play size={17} />
                      </Link>
                    ))}
                  </section>
                ))}
              </div>
            </>
          )}

          {view === "lesson" && (
            <>
              {back("Back to course", "course")}
              <div className="academy-lesson-layout">
                <article>
                  <span className="academy-eyebrow">
                    {curriculum[lesson.moduleIndex].title}
                  </span>
                  <h1 className="academy-lesson-title">{lesson.title}</h1>
                  <div className="academy-player preview-player">
                    <Image
                      src={course.image}
                      alt="Video placement preview"
                      fill
                      sizes="(max-width: 700px) 100vw, 65vw"
                    />
                    <div>
                      <Play size={42} />
                      <strong>Lesson video</strong>
                      <span>
                        Video placeholder. No sample video is included.
                      </span>
                    </div>
                  </div>
                  <section className="academy-lesson-notes">
                    <h2>Lesson notes</h2>
                    <RichText document={initialNotes} />
                  </section>
                  <section className="academy-resources">
                    <h2>Your resources</h2>
                    {["Getting-started-guide.pdf", "Training-notes.docx"].map(
                      (name) => (
                        <button
                          className="academy-resource"
                          onClick={info}
                          key={name}
                        >
                          <Download size={17} />
                          <span>{name}</span>
                          <small>Preview only</small>
                        </button>
                      ),
                    )}
                  </section>
                  {lessonNumber < 11 && (
                    <Link
                      className="academy-button"
                      href={url("lesson", selected, lessonNumber + 1)}
                    >
                      Next lesson
                      <ArrowRight size={17} />
                    </Link>
                  )}
                </article>
                <aside className="academy-lesson-sidebar">
                  <span className="academy-eyebrow">IN THIS MODULE</span>
                  <h2>{curriculum[lesson.moduleIndex].title}</h2>
                  {curriculum[lesson.moduleIndex].lessons.map((title, i) => (
                    <Link
                      key={title}
                      className={i === lessonNumber % 3 ? "active" : ""}
                      href={url("lesson", selected, lesson.moduleIndex * 3 + i)}
                    >
                      <span>0{i + 1}</span>
                      {title}
                      {i === lessonNumber % 3 && <Play size={14} />}
                    </Link>
                  ))}
                </aside>
              </div>
            </>
          )}

          {view === "admin" && (
            <>
              <div className="academy-page-heading">
                <div>
                  <span className="academy-eyebrow">MANAGE YOUR CONTENT</span>
                  <h1>Build something worth sharing.</h1>
                  <p className="academy-muted">
                    Create your curriculum, then bring it to life.
                  </p>
                </div>
                <button className="academy-button" onClick={info}>
                  <Plus size={18} />
                  New course
                </button>
              </div>
              <div className="academy-admin-course-list">
                {courses.map((item, i) => (
                  <Link key={item.title} href={url("manage", i)}>
                    <div>
                      <span className={`academy-status ${item.status}`}>
                        {item.status}
                      </span>
                      <h2>{item.title}</h2>
                      <p>{item.summary}</p>
                    </div>
                    <ArrowUpRight size={23} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {view === "manage" && (
            <>
              {back("All courses", "admin")}
              <div className="academy-page-heading">
                <div>
                  <span className={`academy-status ${course.status}`}>
                    {course.status}
                  </span>
                  <h1>{course.title}</h1>
                  <p className="academy-muted">
                    Your curriculum, in the order you want to teach it.
                  </p>
                </div>
                <Link className="academy-secondary" href={url("course")}>
                  Open learner view
                </Link>
              </div>
              <div className="academy-section-heading">
                <h2>Curriculum</h2>
                <button className="academy-secondary" onClick={info}>
                  <Plus size={16} />
                  Add module
                </button>
              </div>
              {curriculum.map((m, mi) => (
                <section className="academy-admin-module" key={m.title}>
                  <div className="academy-admin-module-heading">
                    <div>
                      <span className="academy-eyebrow">
                        MODULE {mi + 1} · {course.status}
                      </span>
                      <h3>{m.title}</h3>
                    </div>
                  </div>
                  {m.lessons.map((title, li) => (
                    <div className="academy-admin-lesson" key={title}>
                      <div className="academy-admin-lesson-heading">
                        <div>
                          <span className={`academy-status ${course.status}`}>
                            {course.status}
                          </span>
                          <strong>{title}</strong>
                        </div>
                        <button
                          className="academy-secondary"
                          aria-label={`Edit ${title}`}
                          onClick={() => {
                            setEditing(mi * 3 + li);
                            setNotes(initialNotes);
                          }}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      </div>
                      {editing === mi * 3 + li && (
                        <form
                          className="academy-content-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            setNotice(
                              "Preview complete. Changes to sample content are not saved.",
                            );
                            setEditing(null);
                          }}
                        >
                          <h2>Edit lesson</h2>
                          <label>
                            Title
                            <input defaultValue={title} required />
                          </label>
                          <label>
                            Publication status
                            <select defaultValue={course.status}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          </label>
                          <label>
                            Video
                            <select>
                              <option>Welcome-video.mp4 · Sample</option>
                            </select>
                          </label>
                          <span>Lesson description</span>
                          <DescriptionEditor
                            value={notes}
                            onChange={setNotes}
                          />
                          <div className="academy-inline">
                            <button className="academy-button">
                              Finish preview
                            </button>
                            <button
                              className="academy-secondary"
                              type="button"
                              onClick={() => setEditing(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                      <details>
                        <summary>Resources (2)</summary>
                        <p className="academy-muted">
                          Getting-started-guide.pdf · Training-notes.docx
                        </p>
                      </details>
                    </div>
                  ))}
                </section>
              ))}
              <div className="academy-section-heading">
                <h2>Media library</h2>
                <span>Sample files</span>
              </div>
              <div className="academy-upload">
                <div>
                  <UploadCloud size={26} />
                  <h3>Add a file</h3>
                  <p>MP4 video up to 5 GB. Images and resources up to 25 MB.</p>
                </div>
                <button className="academy-secondary" onClick={info}>
                  Upload preview
                </button>
              </div>
              <div className="preview-files">
                {[
                  "Welcome-video.mp4",
                  "Getting-started-guide.pdf",
                  "Training-notes.docx",
                ].map((name) => (
                  <div className="academy-access-row" key={name}>
                    <FileText size={17} />
                    <strong>{name}</strong>
                    <span className="academy-status published">
                      ready · sample
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "members" && (
            <>
              <div className="academy-page-heading">
                <div>
                  <span className="academy-eyebrow">YOUR COMMUNITY</span>
                  <h1>People behind the progress.</h1>
                </div>
              </div>
              <div className="academy-members-layout">
                <div className="academy-member-list">
                  {people.map((person, i) => (
                    <button
                      className={i === memberIndex ? "active" : ""}
                      onClick={() => setMemberIndex(i)}
                      key={person.email}
                    >
                      <strong>{person.name}</strong>
                      <span>{person.email}</span>
                      <small>{person.active ? "learner" : "Paused"}</small>
                    </button>
                  ))}
                </div>
                <section className="academy-member-detail">
                  <h2>{member.name}</h2>
                  <p>{member.email}</p>
                  <button className="academy-secondary" onClick={info}>
                    {member.active ? "Pause account" : "Resume account"}
                  </button>
                  <h3>Course access</h3>
                  <div className="academy-access-row">
                    <strong>{courses[0].title}</strong>
                    <span>
                      {member.source} · {member.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      info();
                    }}
                  >
                    <label>
                      Course
                      <select>
                        {courses.map((c) => (
                          <option key={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Manual access
                      <select>
                        <option>Grant access</option>
                        <option>Remove manual access</option>
                      </select>
                    </label>
                    <label>
                      Reason
                      <input placeholder="e.g. Existing member" />
                    </label>
                    <button className="academy-button">
                      Preview access change
                    </button>
                  </form>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
      <footer className="academy-footer">
        <span>DAWG STRENGTH · THE WORK CONTINUES.</span>
        <span>Local sample · No changes are saved</span>
      </footer>
    </div>
  );
}
