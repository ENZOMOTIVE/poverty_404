import {
  Activity,
  BarChart3,
  FileDown,
  Gauge,
  GitPullRequestArrow,
  MapPinned,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const navigationItems = [
  {
    label: "Overview",
    path: "/",
    icon: Activity,
  },
  {
    label: "Outreach",
    path: "/outreach",
    icon: MapPinned,
  },
  {
    label: "Referrals",
    path: "/referrals",
    icon: GitPullRequestArrow,
  },
  {
    label: "Risk",
    path: "/risk",
    icon: Gauge,
  },
  {
    label: "Operations",
    path: "/operations",
    icon: ClipboardCheck,
  },
  {
    label: "What-if",
    path: "/forecast",
    icon: TrendingUp,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileDown,
  },
  {
    label: "Quality",
    path: "/quality",
    icon: ShieldCheck,
  },
  {
    label: "Scores",
    path: "/scores",
    icon: BarChart3,
  },
] as const;
