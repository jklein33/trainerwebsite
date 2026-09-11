// Legacy guest payments are retired. The course checkout verifies identity and owns fulfillment.
export async function POST() {
  return Response.json(
    { error: "Please sign in and purchase from the course page." },
    { status: 410 },
  );
}
