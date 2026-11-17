import type { Metadata } from "next";
import { TeamTable } from "@/components/demo/team-table";

export const metadata: Metadata = { title: "Team · Team Performance demo" };

export default function TeamPage() {
  return <TeamTable />;
}
