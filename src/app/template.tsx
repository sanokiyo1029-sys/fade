/** Re-keyed on every navigation, so each page rises in (CSS only; calmed by reduced-motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
