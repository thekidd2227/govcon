import { SectionEyebrow } from "../components/SectionEyebrow";
import { COMPANY } from "../data/company";

export function Certifications() {
  return (
    <section id="certifications" className="bg-[#FBFAF5] border-y border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <SectionEyebrow index="04" label="Certifications" />
          <h2 className="section-title mt-6 max-w-[640px]">
            Socioeconomic Business Certifications.
          </h2>
          <div className="hairline-gold mt-8" />
          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--arcg-line-strong)] border border-[var(--arcg-line-strong)] w-full max-w-3xl">
            {COMPANY.certifications.map((c) => (
              <li
                key={c}
                className="bg-arcg-ivory aspect-square flex items-center justify-center relative"
              >
                <span className="font-mono text-[12px] font-semibold tracking-[0.12em] uppercase text-arcg-navy text-center px-2">
                  {c}
                </span>
                <span className="absolute bottom-0 left-3 right-3 h-px bg-arcg-red" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
