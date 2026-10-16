import { Artwork } from "@/components/brand/Artwork";

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="grid min-h-[calc(100svh-var(--header-h))] lg:grid-cols-2">
      <div className="shell flex max-w-xl flex-col justify-center py-12 lg:px-16">{children}</div>
      <div className="dark-zone relative hidden lg:block">
        <Artwork variant="rings" seed={31} tone="dark" marks className="absolute inset-0" />
        <figure className="absolute inset-x-10 bottom-10 border border-line bg-bg p-6">
          <blockquote className="text-[20px] leading-snug tracking-[-0.02em]">“The brief, the files, the money and the conversation all live in one place. That&apos;s the whole pitch, and it&apos;s enough.”</blockquote>
          <figcaption className="label mt-4">MARCUS HALE · NORTHWIND LABS</figcaption>
        </figure>
      </div>
    </div>
  );
}
