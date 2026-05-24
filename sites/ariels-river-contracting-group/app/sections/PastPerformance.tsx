import { SectionEyebrow } from "../components/SectionEyebrow";

export function PastPerformance() {
  return (
    <section id="past-performance" className="border-b border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="07" label="Past Performance" />
        <h2 className="section-title mt-6">Past Performance.</h2>

        <article className="mt-10 grid gap-8 lg:grid-cols-12 border border-[var(--arcg-line-strong)] p-8 lg:p-10 bg-arcg-ivory">
          <div className="lg:col-span-3 font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ink-muted">
            Federal Healthcare
            <div className="mt-2 inline-flex items-center gap-2 text-arcg-red">
              <span className="inline-block w-[5px] h-[5px] rounded-full bg-arcg-red" />
              Reference
            </div>
          </div>
          <div className="lg:col-span-9">
            <h3 className="font-display text-[28px] tracking-[-0.015em] text-arcg-navy leading-snug">
              Mann-Grandstaff VA Medical Center — Spokane, WA
            </h3>
            <p className="mt-3 text-[15px] text-arcg-graphite max-w-[640px]">
              Federal healthcare facility support. Reference available on request.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
