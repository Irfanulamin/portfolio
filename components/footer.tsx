export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 pt-8">
      <div className="flex flex-col gap-2 text-sm text-cream/35 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Irfanul Amin Maruf
        </p>

        {/* A live-feeling status rather than a number. The ping keeps the
            "something is running" quality of a clock without being one. */}
        <p className="font-mono">
          Progress Over Perfection
        </p>
      </div>
    </footer>
  );
}
