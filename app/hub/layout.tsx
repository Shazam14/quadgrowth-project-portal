import { getWebRtcKey } from "@/lib/zadarma";
import HubDialer from "./_components/HubDialer";
import HubNav from "./_components/HubNav";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const widgetKey = await getWebRtcKey();

  return (
    <>
      <HubNav />
      {children}
      <HubDialer widgetKey={widgetKey} />
    </>
  );
}
