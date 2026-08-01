"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LinkedinLogo, GithubLogo, InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react";
import Navbar from "@/components/layout/Navbar";
import type { TeamMember } from "@/lib/strapi";
import { sortTeamMembers } from "@/lib/team";

interface MemberPageClientProps {
  members: TeamMember[];
  id: string;
}

export default function MemberPageClient({ members, id }: MemberPageClientProps) {
  useEffect(() => {
    document.body.classList.add("page-scrollable");
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove("page-scrollable");
    };
  }, [id]);

  const member = members.find((m) => String(m.id) === id);
  const peers = member
    ? sortTeamMembers(members.filter((m) => m.batch === member.batch && m.id !== member.id)).slice(0, 8)
    : [];

  if (!member) {
    return (
      <>
        <Navbar />
        <div className="member-page">
          <p className="member-page__state">Member not found.</p>
          <Link href="/team" className="member-back">
            <ArrowLeft size={14} weight="bold" /> Back to team
          </Link>
        </div>
      </>
    );
  }

  const socials = [
    { label: "LinkedIn", href: member.linkedin, Icon: LinkedinLogo },
    { label: "GitHub", href: member.github, Icon: GithubLogo },
    { label: "Instagram", href: member.instagram, Icon: InstagramLogo },
  ].filter((s) => s.href && s.href !== "#");

  return (
    <>
      <Navbar />
      <div className="member-page">
        <Link href="/team" className="member-back">
          <ArrowLeft size={14} weight="bold" /> Back to team
        </Link>

        <div className="member-hero">
          <div className="member-hero__portrait">
            {member.image ? (
              <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 320px, 380px" />
            ) : (
              <span className="member-hero__initials">
                {member.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            )}
          </div>

          <div className="member-hero__info">
            <p className="member-hero__dept">{member.department}</p>
            <h1 className="member-hero__name">{member.name}</h1>
            <p className="member-hero__role">
              {member.role} · {member.branch}
            </p>

            <div className="member-hero__badges">
              <span className={`member-badge ${member.isAlumni ? "member-badge--alumni" : "member-badge--active"}`}>
                {member.isAlumni ? "Alumni" : "Active Member"}
              </span>
              <span className="member-badge">Class of {member.batch}</span>
            </div>

            <div className="member-socials">
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="member-social" aria-label={`${member.name} on ${label}`}>
                  <Icon size={16} weight="fill" /> {label}
                </a>
              ))}
              {member.email && (
                <a href={`mailto:${member.email}`} className="member-social" aria-label={`Email ${member.name}`}>
                  <EnvelopeSimple size={16} weight="fill" /> Email
                </a>
              )}
            </div>
          </div>
        </div>

        <section className="member-detail">
          <div className="member-about">
            <h2 className="member-about__label">About</h2>
            <p className="member-about__text">{member.bio}</p>
          </div>

          {peers.length > 0 && (
            <aside className="member-peers">
              <h2 className="member-about__label">More from Class of {member.batch}</h2>
              <div className="member-peers__grid">
                {peers.map((p) => (
                  <Link key={p.id} href={`/team/${p.id}`} className="member-peer">
                    <div className="member-peer__avatar">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill sizes="150px" />
                      ) : (
                        <span>
                          {p.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      )}
                    </div>
                    <span className="member-peer__name">{p.name.split(" ")[0]}</span>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </section>
      </div>
    </>
  );
}
