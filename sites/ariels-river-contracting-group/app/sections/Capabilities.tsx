import { SectionEyebrow } from "../components/SectionEyebrow";
import { CAPABILITIES } from "../data/capabilities";

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="bg-[#F2F4F7] border-y border-arcg-navy/10"
    >
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="02" label="Capabilities" />
        <h2 className="section-title mt-6 max-w-[760px]">
          Structured Support Across Critical Facility and Program Needs.
        </h2>
        <p className="mt-4 text-arcg-steel max-w-[520px] text-[16px]">
          Five service lanes operated under a single execution discipline.
        </p>
        <div className="mt-12 grid gap-px bg-arcg-navy/20 border border-arcg-navy/20 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.id}
              className="relative bg-arcg-ivory p-7 lg:p-8 flex flex-col gap-4"
            >
              {/* featured-card accent: full red top-rule */}
              {cap.featured && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] bg-arcg-red"
                />
              )}
              {/* river-blue left-rule on every card for blue rhythm */}
              <span
                aria-hidden
                className="absolute inset-y-7 left-0 w-[2px] bg-arcg-river/70"
              />
              <span
                className="absolute top-7 right-7 font-mono text-[10px] tracking-[0.12em] uppercase text-arcg-navy px-2 py-1 border"
                style={{
                  borderColor: cap.featured ? "#B4232A" : "#1F6F8B",
                }}
              >
                {cap.naics}
              </span>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-steel">
                {cap.index}
              </div>
              <h3 className="font-display text-[24px] leading-[1.2] tracking-[-0.015em] text-arcg-navy pr-20">
                {cap.title}
              </h3>
              <ul className="mt-2 space-y-2 text-[14px] text-arcg-navy/85">
                {cap.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span
                      className={`mt-[7px] inline-block w-1 h-1 rounded-full shrink-0 ${
                        cap.featured ? "bg-arcg-red" : "bg-arcg-river"
                      }`}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-4 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.12em] uppercase text-arcg-steel">
                <span
                  className="inline-block w-[5px] h-[5px] rounded-full"
                  style={{ background: cap.featured ? "#B4232A" : "#1FA6C9" }}
                />
                {cap.featured ? "Primary Lane" : "Active Lane"}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
