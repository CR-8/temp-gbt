import { draftMode } from "next/headers";
import { getSiteSettings, getAbout, getProjects, getAchievements, getTeamMembers } from "@/lib/strapi";
import HomeClient from "./HomeClient";

export default async function Home() {
  const { isEnabled: draft } = await draftMode();
  const [site, about, projects, achievements, team] = await Promise.all([
    getSiteSettings(draft),
    getAbout(draft),
    getProjects(draft),
    getAchievements(draft),
    getTeamMembers(draft),
  ]);

  if (!site || !about) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          textAlign: "center",
          padding: "0 1.5rem",
          overflow: "auto",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>Grobots</h1>
        <p style={{ maxWidth: 480, opacity: 0.6 }}>
          Site content hasn&apos;t been published in Strapi yet. Open the CMS admin, fill in{" "}
          <strong>Site Settings</strong> and <strong>About</strong>, then click Publish.
        </p>
      </main>
    );
  }

  return <HomeClient site={site} about={about} projects={projects} achievements={achievements} team={team} />;
}
