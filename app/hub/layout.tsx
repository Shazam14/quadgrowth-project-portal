import { getWebRtcKey } from "@/lib/zadarma";
import HubDialer from "./_components/HubDialer";
import HubNav from "./_components/HubNav";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const widgetKey = await getWebRtcKey();
  const sipLogin = process.env.ZADARMA_SIP_LOGIN ?? null;

  return (
    <>
      <HubNav />
      {children}
      <HubDialer widgetKey={widgetKey} sipLogin={sipLogin} />
    </>
  );
}
