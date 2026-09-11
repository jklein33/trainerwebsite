// No subscription products in the initial release. Do not mutate customers by submitted email.
export async function POST() {
  return Response.json(
    {
      error: "Subscriptions are not available. Please use the course checkout.",
    },
    { status: 410 },
  );
}
