export default function Loading() {
  return (
    <div className="shell py-12" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-10 w-2/3 max-w-xl rounded-[2px]" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/3] rounded-[2px]" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded-[2px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
