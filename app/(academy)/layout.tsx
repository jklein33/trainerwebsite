import "@/app/academy.css";
import { AcademyNav } from "@/components/courses/ui";
import { context } from "@/lib/courses/server";
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
  let signedIn = false,
    admin = false;
  try {
    const { profile } = await context();
    signedIn = true;
    admin = profile.role === "admin";
  } catch {}
  return (
    <div className="academy">
      <AcademyNav signedIn={signedIn} admin={admin} />
      <div className="academy-container">{children}</div>
      <footer className="academy-footer">
        <span>DAWG STRENGTH · THE WORK CONTINUES.</span>
        <PwaControls />
      </footer>
    </div>
  );
}
