import Navbar from "@/components/Navbar";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* pt-16 compensates for the fixed navbar height */}
      <main className="pt-16">{children}</main>
    </>
  );
}
