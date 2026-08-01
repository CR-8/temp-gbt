"use client";

interface HeroFooterProps {
  items: string[];
}

const FALLBACK_ITEMS = ["Build.", "Break.", "Repeat."];

export default function HeroFooter({ items }: HeroFooterProps) {
  const footerItems = items.length ? items : FALLBACK_ITEMS;

  return (
    <div className="hero-footer">
      {footerItems.map((item) => (
        <div key={item} className="overflow-hidden">
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}
