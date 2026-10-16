import type { Metadata } from "next";
import { Forgot } from "../form";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return <Forgot />;
}
