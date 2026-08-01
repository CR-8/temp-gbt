"use client";

import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import type { SiteSettings } from "@/lib/strapi";

interface FooterProps {
  site: SiteSettings;
}

export default function Footer({ site }: FooterProps) {
  const { footerPhone: phone, footerEmail: email, footerLinks: links, footerSocial: social } = site;

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__contact">
          <span className="footer__phone">{phone}</span>
          <a href={`mailto:${email}`} className="footer__email">
            {email}
          </a>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-label">Navigate</span>
            {links.map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.label} href={l.href} className="footer__link">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} href={l.href} className="footer__link">
                  {l.label}
                </Link>
              )
            )}
          </div>
          <div className="footer__col">
            <span className="footer__col-label">Social</span>
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="footer__link footer__link--social"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__brand">
        <span className="footer__brand-name">{site.brandName}</span>
        <span className="footer__brand-reg">®</span>
      </div>
    </footer>
  );
}
