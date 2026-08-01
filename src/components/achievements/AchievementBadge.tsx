"use client";

import { Trophy, Medal, Seal, Robot, RocketLaunch, SoccerBall, Lightbulb, Drone } from "@phosphor-icons/react";
import TiltedCard from "../ui/TiltedCard";
import type { ResultItem } from "@/lib/strapi";

export interface AchievementBadgeData {
  id: number;
  event: string;
  category: string | null;
  name: string;
  year: number;
  position: number;
}

const POSITION_CONFIG: Record<
  number,
  { label: string; Icon: React.ElementType; gradient: string; glow: string; accent: string; border: string }
> = {
  1: {
    label: "1st Place",
    Icon: Trophy,
    gradient: "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(180,140,20,0.08) 100%)",
    glow: "rgba(212,175,55,0.25)",
    accent: "#d4af37",
    border: "rgba(212,175,55,0.4)",
  },
  2: {
    label: "2nd Place",
    Icon: Medal,
    gradient: "linear-gradient(135deg, rgba(180,190,210,0.15) 0%, rgba(140,155,180,0.06) 100%)",
    glow: "rgba(180,190,210,0.2)",
    accent: "#b4bec8",
    border: "rgba(180,190,210,0.35)",
  },
  3: {
    label: "3rd Place",
    Icon: Seal,
    gradient: "linear-gradient(135deg, rgba(176,120,70,0.15) 0%, rgba(140,90,40,0.06) 100%)",
    glow: "rgba(176,120,70,0.2)",
    accent: "#b07846",
    border: "rgba(176,120,70,0.35)",
  },
};

const EVENT_ICON: Record<string, React.ElementType> = {
  "Robo War": Robot,
  "Robo Race": RocketLaunch,
  "Robo Soccer": SoccerBall,
  "Open Innovation": Lightbulb,
  "Drone Tech": Drone,
};

export default function AchievementBadge({ achievement }: { achievement: AchievementBadgeData }) {
  const cfg = POSITION_CONFIG[achievement.position] ?? POSITION_CONFIG[3];
  const PosIcon = cfg.Icon;
  const EvtIcon = EVENT_ICON[achievement.event] ?? Robot;

  return (
    <TiltedCard rotateAmplitude={10} scaleOnHover={1.05}>
      <div
        className="achievement-badge"
        style={{
          background: cfg.gradient,
          borderColor: cfg.border,
          boxShadow: `0 8px 32px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <div className="achievement-badge__glass" />
        <div className="achievement-badge__orb" style={{ background: `radial-gradient(circle at 70% 20%, ${cfg.glow}, transparent 65%)` }} />

        <div className="achievement-badge__top">
          <PosIcon weight="fill" size={22} style={{ color: cfg.accent }} />
          <span className="achievement-badge__pos" style={{ color: cfg.accent }}>
            {cfg.label}
          </span>
        </div>

        <div className="achievement-badge__chip">
          <EvtIcon weight="duotone" size={12} />
          <span>{achievement.event}</span>
          {achievement.category && <span className="achievement-badge__cat">{achievement.category}</span>}
        </div>

        <div className="achievement-badge__body">
          <p className="achievement-badge__name">{achievement.name}</p>
          <span className="achievement-badge__year">{achievement.year}</span>
        </div>

        <div className="achievement-badge__line" style={{ background: `linear-gradient(90deg, ${cfg.accent}, transparent)` }} />
      </div>
    </TiltedCard>
  );
}

export type { ResultItem };
