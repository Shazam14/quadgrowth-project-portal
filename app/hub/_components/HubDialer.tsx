"use client";

import Script from "next/script";

export default function HubDialer({
  widgetKey,
  sipLogin,
}: {
  widgetKey: string | null;
  sipLogin: string | null;
}) {
  if (!widgetKey || !sipLogin) return null;

  return (
    <>
      <Script
        id="zadarma-lib"
        src="https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-lib.js?sub_v=1"
        strategy="afterInteractive"
      />
      <Script
        id="zadarma-fn"
        src="https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-fn.js?sub_v=1"
        strategy="afterInteractive"
        onLoad={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).zadarmaWidgetFn?.(
            widgetKey,
            sipLogin,
            "square",
            "en",
            true,
            { right: "10px", bottom: "5px" },
          );
        }}
      />
    </>
  );
}
