import type { Metadata } from "next";
import { Extensions } from "@/components/demo/extensions";

export const metadata: Metadata = { title: "Extensions · Team Performance demo" };

export default function SettingsPage() {
  return <Extensions />;
}
