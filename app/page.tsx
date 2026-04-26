import fs from "node:fs";
import path from "node:path";
import "./page.css";

const roadmapHtml = fs.readFileSync(
  path.join(process.cwd(), "app/_content/roadmap.html"),
  "utf8",
);

export const metadata = {
  title: "QuadGrowth — Client Portal Roadmap",
  description:
    "Phased plan for the QuadGrowth client-facing platform. Internal CEO + build guide.",
};

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: roadmapHtml }} />;
}
