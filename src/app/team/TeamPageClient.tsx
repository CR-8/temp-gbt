"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlass as SearchIcon } from "@phosphor-icons/react";
import Navbar from "@/components/layout/Navbar";
import type { TeamMember } from "@/lib/strapi";
import { sortTeamMembers } from "@/lib/team";

interface TeamPageClientProps {
  members: TeamMember[];
}

export default function TeamPageClient({ members }: TeamPageClientProps) {
  const [activeDept, setActiveDept] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.classList.add("page-scrollable");
    return () => {
      document.body.classList.remove("page-scrollable");
    };
  }, []);

  const departments = useMemo(() => {
    const deps = new Set(members.map((m) => m.department));
    return ["All", ...Array.from(deps)];
  }, [members]);

  const filtered = useMemo(() => {
    const sorted = sortTeamMembers(members);
    return sorted.filter((m) => {
      const matchDept = activeDept === "All" || m.department === activeDept;
      const matchQuery =
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.role.toLowerCase().includes(query.toLowerCase()) ||
        m.branch.toLowerCase().includes(query.toLowerCase());
      return matchDept && matchQuery;
    });
  }, [activeDept, query, members]);

  return (
    <>
      <Navbar />
      <div className="team-page">
        <header className="team-header">
          <h1 className="team-header__title">Meet Our Team</h1>
          <p className="team-header__sub">
            The engineers, builders, and tinkerers behind every bot that&apos;s ever entered an arena under the Grobots
            banner. No passengers — everyone builds.
          </p>
        </header>

        <div className="team-filters">
          <div className="team-filters__tabs">
            {departments.map((d) => (
              <button
                key={d}
                className={`team-filters__tab ${activeDept === d ? "team-filters__tab--active" : ""}`}
                onClick={() => setActiveDept(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="team-filters__search">
            <SearchIcon size={14} weight="bold" className="team-filters__search-icon" />
            <input
              type="text"
              placeholder="Search members"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="team-filters__input"
            />
          </div>
        </div>

        <div className="team-grid">
          {filtered.map((member) => (
            <Link key={member.id} href={`/team/${member.id}`} className="team-card">
              <div className="team-card__avatar">
                {member.image ? (
                  <Image src={member.image} alt={member.name} fill sizes="120px" />
                ) : (
                  <span className="team-card__initials">
                    {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                )}
              </div>
              <div className="team-card__info">
                <h3 className="team-card__name">{member.name}</h3>
                <p className="team-card__role">{member.role}</p>
              </div>
              <p className="team-card__exp">
                {member.branch} · Batch {member.batch}
              </p>
            </Link>
          ))}
          {filtered.length === 0 && <p className="team-grid__empty">No members found.</p>}
        </div>
      </div>
    </>
  );
}
