type SectionProps = {
  id: string;
  label: string;
  description: string;
  children: React.ReactNode;
};

export function Section({ id, label, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 pt-24">
      <div className="space-y-1.5">
        <h2 className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">
          {label}
        </h2>
        <p className="text-base leading-[1.6] text-cream/55">{description}</p>
      </div>

      <div className="mt-7">{children}</div>
    </section>
  );
}
