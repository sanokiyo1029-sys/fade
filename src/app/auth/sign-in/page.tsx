import type { Metadata } from "next";
import { SignIn } from "../form";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <SignIn />;
}
