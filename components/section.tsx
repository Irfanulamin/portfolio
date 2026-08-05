type SectionProps = {
  id: string;
  label: string;
  description: string;
  children: React.ReactNode;
};

export function Section({ id, label, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 pt-20">
      <div className="space-y-1.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          {label}
        </h2>
        <p className="text-base text-cream/55">{description}</p>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
