import type { Metadata } from "next";
import { getTeamMembers } from "@/lib/strapi";
import TeamPageClient from "./TeamPageClient";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the engineers, builders, and tinkerers behind every bot Grobots has ever entered into an arena.",
};

export default async function TeamPage() {
  const members = await getTeamMembers();
  return <TeamPageClient members={members} />;
}
