import { Zap, Cog, Building2, Sprout, Landmark, Atom, FlaskConical, Plane, LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Zap,
  Cog,
  Building2,
  Sprout,
  Landmark,
  Atom,
  FlaskConical,
  Plane,
};

export const getIcon = (name: string): LucideIcon => {
  return iconMap[name] || Zap;
};
