import { SectionEyebrow } from "../components/SectionEyebrow";
import { DIFFERENTIATORS } from "../data/capabilities";

export function Differentiators() {
  return (
    <section className="border-b border-arcg-navy/10">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="03" label="Why ARCG" />
        <h2 className="section-title mt-6 max-w-[680px]">
          Why Procurement Teams Choose ARCG.
        </h2>
        <div className="mt-14 grid gap-px bg-arcg-navy/10 border border-arcg-navy/15 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d, i) => {
            const accent = i % 2 === 0 ? "bg-arcg-red" : "bg-arcg-river";
            return (
              <div key={d.title} className="bg-arcg-ivory p-7 lg:p-8 flex gap-5 relative">
                <span aria-hidden className={`absolute top-0 left-0 w-10 h-[2px] ${accent}`} />
                <span className={`font-mono text-[11px] tracking-[0.14em] pt-1 shrink-0 ${i % 2 === 0 ? "text-arcg-red" : "text-arcg-river"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-[20px] leading-[1.25] tracking-[-0.01em] text-arcg-navy">
                    {d.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.55] text-arcg-navy/85">
                    {d.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
