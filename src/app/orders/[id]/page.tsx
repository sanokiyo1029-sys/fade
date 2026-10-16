import type { Metadata } from "next";
import { Workspace } from "./Workspace";

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  return { title: `Order #${(await params).id}` };
}

export default async function Page({ params }: PageProps<"/orders/[id]">) {
  return <Workspace id={(await params).id} />;
}
