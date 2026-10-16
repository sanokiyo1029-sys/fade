import type { Metadata } from "next";
import { SignUp } from "../form";

export const metadata: Metadata = { title: "Join" };

export default function Page() {
  return <SignUp />;
}
