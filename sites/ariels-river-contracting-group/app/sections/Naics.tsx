import { SectionEyebrow } from "../components/SectionEyebrow";
import { NAICS_PRIMARY, NAICS_SECONDARY } from "../data/naics";

export function Naics() {
  return (
    <section className="bg-[#FBFAF5] border-b border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="06" label="NAICS" />
        <h2 className="section-title mt-6">NAICS Codes.</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ink-muted">
              Primary
            </div>
            <div className="mt-4 border-l-2 border-arcg-gold pl-5">
              <div className="font-mono text-[34px] tracking-[-0.01em] text-arcg-navy">
                {NAICS_PRIMARY.code}
              </div>
              <div className="mt-2 font-display text-[20px] text-arcg-navy leading-snug">
                {NAICS_PRIMARY.label}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 lg:border-l lg:border-[var(--arcg-line)] lg:pl-10">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ink-muted">
              Additional
            </div>
            <ul className="mt-4 divide-y divide-[var(--arcg-line)]">
              {NAICS_SECONDARY.map((n) => (
                <li key={n.code} className="py-4 flex gap-6 items-baseline">
                  <span className="font-mono text-[16px] text-arcg-navy w-20 shrink-0">
                    {n.code}
                  </span>
                  <span className="text-[15px] text-arcg-graphite">{n.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
