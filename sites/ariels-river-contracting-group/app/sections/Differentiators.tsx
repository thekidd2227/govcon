import { SectionEyebrow } from "../components/SectionEyebrow";
import { DIFFERENTIATORS } from "../data/capabilities";

export function Differentiators() {
  return (
    <section className="border-b border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="03" label="Why ARCG" />
        <h2 className="section-title mt-6 max-w-[680px]">
          Why Procurement Teams Choose ARCG.
        </h2>
        <div className="mt-14 grid gap-px bg-[var(--arcg-line)] border border-[var(--arcg-line)] sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d, i) => (
            <div key={d.title} className="bg-arcg-ivory p-7 lg:p-8 flex gap-5">
              <span className="font-mono text-[11px] tracking-[0.12em] text-arcg-red pt-1 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[20px] leading-[1.25] tracking-[-0.01em] text-arcg-navy">
                  {d.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-arcg-graphite">
                  {d.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
