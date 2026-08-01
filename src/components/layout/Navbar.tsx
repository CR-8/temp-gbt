"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LinkItem } from "@/lib/strapi";

const FALLBACK_LINKS: LinkItem[] = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Team", href: "/team" },
];

// Fixed nav entries that aren't editorial content from the CMS — a page
// route added by this codebase and a permanent link to the parent club's
// external learning portal — so they show up regardless of what's in Strapi.
const STATIC_TRAILING_LINKS: LinkItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Learn", href: "https://learn.roboticsclubsrmcem.in/" },
];

interface NavbarProps {
  brandName?: string;
  links?: LinkItem[];
}

export default function Navbar({ brandName = "Grobots", links }: NavbarProps) {
  const pathname = usePathname();
  const navLinks = [...(links?.length ? links : FALLBACK_LINKS), ...STATIC_TRAILING_LINKS];

  return (
    <nav className="navbar">
      <div className="nav-logo overflow-hidden">
        <Link href="/">
          <Image src="/Grobotslogo.png" alt={brandName} width={41} height={32} className="nav-logo__img" priority />
        </Link>
      </div>
      <div className="nav-links">
        {navLinks.map((link) => (
          <div key={link.label} className="overflow-hidden">
            {link.href.startsWith("http") ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="nav-link">
                {link.label}
              </a>
            ) : link.href.startsWith("/#") ? (
              <a href={link.href} className="nav-link">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={`nav-link ${pathname === link.href ? "nav-active" : ""}`}>
                {link.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
