import { SectionEyebrow } from "../components/SectionEyebrow";
import { COMPANY } from "../data/company";

export function Overview() {
  return (
    <section className="border-t border-arcg-navy/10">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="01" label="Overview" />
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <h2 className="section-title lg:col-span-6 max-w-[520px]">
            A Government-Ready Partner Built for Reliable Execution.
          </h2>
          <div className="lg:col-span-6 lg:pl-6 lg:border-l lg:border-arcg-navy/10">
            <div className="hairline-gold mb-6 lg:hidden" />
            <p className="text-[18px] leading-[1.6] text-arcg-navy/85 max-w-[560px]">
              {COMPANY.legalName} provides scalable support solutions for government and
              commercial clients, with core capabilities across pest control, language
              access, staffing, janitorial, and emergency relief services. As an SDVOSB,
              ARCG prioritizes compliance, safety, timely delivery, and client satisfaction.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="hairline-red" />
              <span className="hairline-river" />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-steel">
                SDVOSB · Veteran-Owned
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
