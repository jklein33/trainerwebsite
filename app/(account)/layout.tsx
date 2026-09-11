import "@/app/academy.css";
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="academy">{children}</div>;
}
