import { redirect } from "next/navigation";
import { context, CourseError, checked } from "@/lib/courses/server";
export default async function CheckoutPage() {
  let courseId: string | undefined;
  try {
    const { db } = await context();
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (priceId) {
      const courses = checked(
        await db
          .from("courses")
          .select("id")
          .eq("stripe_price_id", priceId)
          .eq("status", "published")
          .limit(1),
      );
      courseId = courses[0]?.id;
    }
  } catch (error) {
    if (error instanceof CourseError && error.status === 401)
      redirect("/login?next=/checkout");
    if (error instanceof CourseError && error.status === 503)
      redirect("/learn");
    throw error;
  }
  redirect(courseId ? `/learn/${courseId}` : "/learn");
}
