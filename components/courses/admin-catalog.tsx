"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import type { Course } from "@/lib/courses/types";
import { ContentForm } from "./content-form";
export function AdminCatalog({ courses }: { courses: Course[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <div className="academy-page-heading">
        <div>
          <span className="academy-eyebrow">MANAGE YOUR CONTENT</span>
          <h1>Build something worth sharing.</h1>
          <p className="academy-muted">
            Create your curriculum, then bring it to life.
          </p>
        </div>
        <button className="academy-button" onClick={() => setCreating(true)}>
          <Plus size={18} /> New course
        </button>
      </div>
      {creating && (
        <ContentForm type="course" onDone={() => setCreating(false)} />
      )}
      <div className="academy-admin-course-list">
        {courses.map((course) => (
          <Link key={course.id} href={`/admin/courses/${course.id}`}>
            <div>
              <span className={`academy-status ${course.status}`}>
                {course.status}
              </span>
              <h2>{course.title}</h2>
              <p>
                {course.summary ||
                  "Add a description to introduce your course."}
              </p>
            </div>
            <ArrowUpRight size={23} />
          </Link>
        ))}
      </div>
      {!courses.length && !creating && (
        <div className="academy-empty">
          <h2>Start with your first course.</h2>
          <p>
            Add modules and lessons as your material takes shape. Drafts stay
            private.
          </p>
          <button className="academy-button" onClick={() => setCreating(true)}>
            Create a course
          </button>
        </div>
      )}
    </>
  );
}
