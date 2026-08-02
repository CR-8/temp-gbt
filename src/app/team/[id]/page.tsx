import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getTeamMembers } from "@/lib/strapi";
import MemberPageClient from "./MemberPageClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const members = await getTeamMembers();
  const member = members.find((m) => String(m.id) === id);
  if (!member) return { title: "Member not found" };
  return {
    title: member.name,
    description: `${member.name} — ${member.role}, ${member.branch}, Class of ${member.batch} at Grobots.`,
    openGraph: member.image ? { images: [{ url: member.image }] } : undefined,
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isEnabled: draft } = await draftMode();
  const members = await getTeamMembers(draft);
  return <MemberPageClient members={members} id={id} />;
}
