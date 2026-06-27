import {
  Activity,
  BarChart3,
  ClipboardList,
  Gauge,
  GitPullRequestArrow,
  MapPinned,
  ShieldCheck,
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
    label: "Queue",
    path: "/queue",
    icon: ClipboardList,
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
