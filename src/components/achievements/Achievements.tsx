"use client";

import type { Achievement, ResultItem } from "@/lib/strapi";
import { useAchievementHover, AchievementFloatingImage } from "./AchievementHoverImage";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
const ORDINAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
const POSITION_COLOR: Record<number, string> = {
  1: "rgba(212,175,55,0.75)",
  2: "rgba(180,190,210,0.65)",
  3: "rgba(176,120,70,0.65)",
};

function bestPosition(a: { results: ResultItem[] }): number {
  return Math.min(...a.results.map((r) => r.position));
}

function sortAchievements(items: Achievement[]) {
  return [...items]
    .sort((a, b) => {
      const positionDiff = bestPosition(a) - bestPosition(b);
      if (positionDiff !== 0) return positionDiff;
      return b.year - a.year;
    })
    .map((a) => ({ ...a, results: [...a.results].sort((r1, r2) => r1.position - r2.position) }));
}

function AchievementRow({
  a,
  i,
  onHoverStart,
  onHoverEnd,
}: {
  a: Achievement;
  i: number;
  onHoverStart: (src: string) => void;
  onHoverEnd: () => void;
}) {
  return (
    <div
      className="achievement-row"
      onMouseEnter={a.image ? () => onHoverStart(a.image) : undefined}
      onMouseLeave={a.image ? onHoverEnd : undefined}
    >
      <div className="achievement-row__main">
        <h2 className="achievement-row__title">
          {a.name}
          <sup className="achievement-row__numeral">{ROMAN[i] ?? ""}</sup>
        </h2>
        <span className="achievement-row__location">{a.location}</span>
      </div>

      <div className="achievement-row__meta">
        <div className="achievement-row__results">
          {a.results.map((r, ri) => (
            <span key={ri} className="achievement-row__pill" style={{ borderColor: POSITION_COLOR[r.position] }}>
              <span style={{ color: POSITION_COLOR[r.position] }}>{ORDINAL[r.position] ?? `${r.position}th`}</span>{" "}
              {r.event}
              {r.category ? ` ${r.category}` : ""}
            </span>
          ))}
        </div>
        <span className="achievement-row__year">{a.year}</span>
      </div>
    </div>
  );
}

interface AchievementsProps {
  achievements: Achievement[];
  label: string;
}

export default function Achievements({ achievements, label }: AchievementsProps) {
  const sorted = sortAchievements(achievements);
  // Dual-sided timeline: 1st, 3rd, 5th... on the left; 2nd, 4th, 6th... on
  // the right, trophy centered between them. Original rank (index `i`) is
  // preserved on each entry so the roman numeral still matches its overall
  // position, not its position within its own side.
  const left = sorted.filter((_, i) => i % 2 === 0).map((a, idx) => ({ a, i: idx * 2 }));
  const right = sorted.filter((_, i) => i % 2 !== 0).map((a, idx) => ({ a, i: idx * 2 + 1 }));

  const { springX, springY, activeImage, setActiveImage, onContainerMouseMove } = useAchievementHover();

  return (
    <section className="achievements">
      <div className="achievements__sidebar">
        <span className="achievements__count">{String(sorted.length).padStart(2, "0")}</span>
        <span className="achievements__label">{label || "Achievements"}</span>
      </div>

      <div className="achievements-timeline" onMouseMove={onContainerMouseMove}>
        <div className="achievements-timeline__line" aria-hidden="true" />

        <div className="achievements-timeline__col achievements-timeline__col--left">
          {left.map(({ a, i }) => (
            <AchievementRow key={a.id} a={a} i={i} onHoverStart={setActiveImage} onHoverEnd={() => setActiveImage(null)} />
          ))}
        </div>

        <div className="achievements-timeline__col achievements-timeline__col--right">
          {right.map(({ a, i }) => (
            <AchievementRow key={a.id} a={a} i={i} onHoverStart={setActiveImage} onHoverEnd={() => setActiveImage(null)} />
          ))}
        </div>

        <AchievementFloatingImage src={activeImage} x={springX} y={springY} />
      </div>
    </section>
  );
}
