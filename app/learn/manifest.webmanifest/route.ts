export async function GET() {
  return Response.json(
    {
      id: "/learn/",
      name: "Dawg Strength Courses",
      short_name: "Dawg Courses",
      description: "Your Dawg Strength course room.",
      start_url: "/learn",
      scope: "/learn",
      display: "standalone",
      background_color: "#101111",
      theme_color: "#101111",
      icons: [
        {
          src: "/course-icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/course-icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
