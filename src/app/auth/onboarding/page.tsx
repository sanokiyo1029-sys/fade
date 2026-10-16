import type { Metadata } from "next";
import { Onboarding } from "../form";

export const metadata: Metadata = { title: "Welcome" };

export default function Page() {
  return <Onboarding />;
}
