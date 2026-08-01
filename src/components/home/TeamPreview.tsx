"use client";

import Link from "next/link";
import Image from "next/image";
import { LinkedinLogo } from "@phosphor-icons/react";
import type { SiteSettings, TeamMember } from "@/lib/strapi";

interface TeamPreviewProps {
  site: SiteSettings;
  members: TeamMember[];
}

export default function TeamPreview({ site, members }: TeamPreviewProps) {
  if (!site || members.length === 0) return null;

  const { teamPreviewFeaturedBatch: featuredBatch, teamPreviewLabel: label, teamPreviewCtaLabel, teamPreviewCtaHref } = site;
  const featured = members.filter((m) => m.batch === featuredBatch);

  return (
    <section className="team-preview">
      <div className="team-preview__header">
        <span className="team-preview__label">{label}</span>
        <Link href={teamPreviewCtaHref || "/team"} className="team-preview__cta">
          {teamPreviewCtaLabel || "View All →"}
        </Link>
      </div>
      <div className="team-preview__grid">
        {featured.map((member, i) => (
          <div
            key={member.id}
            className={`team-preview__card ${i % 2 === 0 ? "team-preview__card--tall" : "team-preview__card--short"}`}
          >
            <div className="team-preview__img-wrap">
              {member.image ? (
                <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 50vw, 300px" />
              ) : (
                <span className="team-card__initials">
                  {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              )}
            </div>
            <div className="team-preview__info">
              <div className="team-preview__text">
                <p className="team-preview__name">{member.name}</p>
                <p className="team-preview__role">
                  {member.role} · {member.branch}
                </p>
              </div>
              {member.linkedin && member.linkedin !== "#" && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-preview__linkedin"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <LinkedinLogo weight="fill" size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
