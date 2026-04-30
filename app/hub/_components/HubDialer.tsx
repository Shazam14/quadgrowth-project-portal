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

  // Capture in local vars — closures in onLoad callbacks need stable references
  const key = widgetKey;
  const sip = sipLogin;

  return (
    <Script
      id="zadarma-lib"
      src="https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-lib.js?sub_v=1"
      strategy="afterInteractive"
      onLoad={() => {
        // Dynamically inject fn.js only after lib.js has fully executed.
        // Two separate <Script> tags with afterInteractive don't guarantee order.
        const fn = document.createElement("script");
        fn.src =
          "https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-fn.js?sub_v=1";
        fn.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).zadarmaWidgetFn?.(key, sip, "square", "en", true, {
            right: "10px",
            bottom: "5px",
          });
        };
        document.head.appendChild(fn);
      }}
    />
  );
}
