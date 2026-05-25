import { SectionEyebrow } from "../components/SectionEyebrow";
import { PAST_PERFORMANCE } from "../data/past-performance";

export function PastPerformance() {
  return (
    <section id="past-performance" className="border-b border-arcg-navy/10">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="07" label="Past Performance" />
        <h2 className="section-title mt-6">Past Performance.</h2>

        <div className="mt-10 grid gap-px bg-arcg-navy/15 border border-arcg-navy/20 md:grid-cols-3">
          {PAST_PERFORMANCE.map((item, i) => {
            const accent = i % 2 === 0 ? "red" : "river";
            return (
              <article
                key={item.id}
                className="relative bg-arcg-ivory p-7 lg:p-8 flex flex-col gap-4"
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-[2px] ${
                    accent === "red" ? "bg-arcg-red" : "bg-arcg-river"
                  }`}
                />
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-steel inline-flex items-center gap-2">
                  <span
                    className={`inline-block w-[5px] h-[5px] rounded-full ${
                      accent === "red" ? "bg-arcg-red" : "bg-arcg-river"
                    }`}
                  />
                  {item.category}
                </div>
                <h3 className="font-display text-[22px] tracking-[-0.015em] text-arcg-navy leading-snug">
                  {item.client}
                </h3>
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-arcg-navy/65">
                  {item.location}
                </div>
                <p className="text-[14px] leading-[1.55] text-arcg-navy/85">
                  {item.scope}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-[12px] font-mono tracking-[0.12em] uppercase text-arcg-steel">
          References, contract numbers, and scope details available upon request.
        </p>
      </div>
    </section>
  );
}
