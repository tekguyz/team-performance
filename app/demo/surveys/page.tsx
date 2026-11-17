import type { Metadata } from "next";
import { CallLog } from "@/components/demo/call-log";

export const metadata: Metadata = { title: "Surveys · Team Performance demo" };

export default function SurveysPage() {
  return <CallLog />;
}
