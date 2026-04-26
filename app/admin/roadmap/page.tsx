import fs from "node:fs";
import path from "node:path";
import "./roadmap.css";

const roadmapHtml = fs.readFileSync(
  path.join(process.cwd(), "app/admin/roadmap/_content/roadmap.html"),
  "utf8",
);

export const metadata = {
  title: "QuadGrowth — Client Portal Roadmap",
  description:
    "Phased plan for the QuadGrowth client-facing platform. Internal CEO + build guide.",
};

export default function RoadmapPage() {
  return <div dangerouslySetInnerHTML={{ __html: roadmapHtml }} />;
}
