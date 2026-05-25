import { SectionEyebrow } from "../components/SectionEyebrow";
import { COMPANY } from "../data/company";

export function Certifications() {
  return (
    <section
      id="certifications"
      className="bg-[#F2F4F7] border-y border-arcg-navy/10"
    >
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <SectionEyebrow index="04" label="Certifications" />
          <h2 className="section-title mt-6 max-w-[640px]">
            Socioeconomic Business Certifications.
          </h2>
          <div className="mt-8 flex items-center gap-4">
            <span className="hairline-red" />
            <span className="hairline-gold" />
            <span className="hairline-river" />
          </div>
          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-arcg-navy/20 border border-arcg-navy/20 w-full max-w-3xl">
            {COMPANY.certifications.map((c, i) => (
              <li
                key={c}
                className="bg-arcg-ivory aspect-square flex items-center justify-center relative"
              >
                <span className="font-mono text-[12px] font-semibold tracking-[0.12em] uppercase text-arcg-navy text-center px-2">
                  {c}
                </span>
                {/* alternating red/river bottom rule */}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-px ${
                    i % 2 === 0 ? "bg-arcg-red" : "bg-arcg-river"
                  }`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
