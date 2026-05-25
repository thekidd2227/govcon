import { SectionEyebrow } from "../components/SectionEyebrow";
import { NAICS_PRIMARY, NAICS_SECONDARY } from "../data/naics";

export function Naics() {
  return (
    <section className="bg-[#F2F4F7] border-b border-arcg-navy/10">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="06" label="NAICS" />
        <h2 className="section-title mt-6">NAICS Codes.</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-red">
              Primary
            </div>
            <div className="mt-4 border-l-[3px] border-arcg-gold pl-5 relative">
              <span aria-hidden className="absolute -left-[3px] top-0 w-[3px] h-8 bg-arcg-red" />
              <div className="font-mono text-[34px] tracking-[-0.01em] text-arcg-navy">
                {NAICS_PRIMARY.code}
              </div>
              <div className="mt-2 font-display text-[20px] text-arcg-navy leading-snug">
                {NAICS_PRIMARY.label}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 lg:border-l lg:border-arcg-navy/10 lg:pl-10">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-river">
              Additional
            </div>
            <ul className="mt-4 divide-y divide-arcg-navy/10">
              {NAICS_SECONDARY.map((n, i) => (
                <li
                  key={n.code}
                  className="py-4 flex gap-6 items-baseline relative"
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${
                      i % 2 === 0 ? "bg-arcg-river" : "bg-arcg-red"
                    }`}
                  />
                  <span className="font-mono text-[16px] text-arcg-navy w-20 shrink-0 pl-4">
                    {n.code}
                  </span>
                  <span className="text-[15px] text-arcg-navy/85">{n.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
