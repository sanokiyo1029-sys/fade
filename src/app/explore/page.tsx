import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "../loading";
import { Explore } from "./Explore";

export const metadata: Metadata = { title: "Explore services" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Explore />
    </Suspense>
  );
}
