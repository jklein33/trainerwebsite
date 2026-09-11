import Link from "next/link";
export function SetupNotice() {
  return (
    <section className="academy-empty">
      <span className="academy-eyebrow">COMING INTO FOCUS</span>
      <h1>Your course room is on its way.</h1>
      <p>
        We’re getting everything ready. Please check back soon, or contact us if
        you need help with an existing purchase.
      </p>
      <Link
        href={`${process.env.NEXT_PUBLIC_SITE_URL || "/"}#contact`}
        className="academy-button"
      >
        Contact Dawg Strength
      </Link>
    </section>
  );
}
