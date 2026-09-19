import "@/app/academy.css";
import { AcademyNav } from "@/components/courses/ui";
import { pageContext } from "@/lib/courses/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { PwaControls } from "@/components/courses/pwa-controls";
export const metadata = {
  title: "Course Room | Dawg Strength",
  robots: { index: false, follow: false },
  manifest: "/learn/manifest.webmanifest",
};
export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = supabaseConfigured() ? await pageContext() : null;
  return (
    <div className="academy">
      <AcademyNav
        signedIn={Boolean(account)}
        admin={account?.profile.role === "admin"}
      />
      <div className="academy-container">{children}</div>
      <footer className="academy-footer">
        <span>DAWG STRENGTH · THE WORK CONTINUES.</span>
        <PwaControls />
      </footer>
    </div>
  );
}
