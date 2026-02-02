import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";

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
      <AIChatWidget />
    </>
  );
}
