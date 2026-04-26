import HubNav from "./_components/HubNav";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HubNav />
      {children}
    </>
  );
}
