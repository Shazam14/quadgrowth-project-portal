import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import "./branding.css";

const html = fs.readFileSync(
  path.join(process.cwd(), "app/hub/branding/_content/branding.html"),
  "utf8",
);

const script = `
window.showSection = function(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (window.event && window.event.target) window.event.target.classList.add('active');
};
window.copyCode = function(btn) {
  const block = btn.parentElement;
  const text = block.innerText.replace('Copy','').trim();
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
};
`;

export const metadata = { title: "Brand Kit · QuadGrowth Hub" };

export default function BrandingPage() {
  return (
    <>
      <div
        className="brand-kit-page"
        data-testid="brand-kit"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Script id="brand-kit-inline" strategy="afterInteractive">
        {script}
      </Script>
    </>
  );
}
