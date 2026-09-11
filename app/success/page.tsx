import "@/app/academy.css";
import Link from "next/link";
import { OrderStatus } from "@/components/courses/order-status";
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = (await searchParams).session_id;
  return (
    <div className="academy">
      <main className="academy-container">
        {session && /^cs_[A-Za-z0-9_]+$/.test(session) ? (
          <OrderStatus sessionId={session} />
        ) : (
          <section className="academy-empty">
            <h1>Thank you for your purchase.</h1>
            <p>
              Please check your payment confirmation email. For an existing
              purchase, contact support to arrange your course access.
            </p>
            <Link href="/learn" className="academy-button">
              My courses
            </Link>
            <Link href="/#contact">Contact support</Link>
          </section>
        )}
      </main>
    </div>
  );
}
