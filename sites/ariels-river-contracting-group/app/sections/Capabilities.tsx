import { SectionEyebrow } from "../components/SectionEyebrow";
import { CAPABILITIES } from "../data/capabilities";

export function Capabilities() {
  return (
    <section id="capabilities" className="bg-[#FBFAF5] border-y border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="02" label="Capabilities" />
        <h2 className="section-title mt-6 max-w-[760px]">
          Structured Support Across Critical Facility and Program Needs.
        </h2>
        <p className="mt-4 text-arcg-ink-muted max-w-[520px] text-[16px]">
          Five service lanes operated under a single execution discipline.
        </p>
        <div className="mt-12 grid gap-px bg-[var(--arcg-line-strong)] border border-[var(--arcg-line-strong)] sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.id}
              className={`relative bg-arcg-ivory p-7 lg:p-8 flex flex-col gap-4 ${
                cap.featured ? "lg:col-span-1" : ""
              }`}
            >
              <span
                className="absolute top-7 right-7 font-mono text-[10px] tracking-[0.12em] uppercase text-arcg-graphite px-2 py-1 border border-arcg-graphite/30"
                style={cap.featured ? { borderColor: "#B4232A" } : undefined}
              >
                {cap.naics}
              </span>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-ink-muted">
                {cap.index}
              </div>
              <h3 className="font-display text-[24px] leading-[1.2] tracking-[-0.015em] text-arcg-navy pr-20">
                {cap.title}
              </h3>
              <ul className="mt-2 space-y-2 text-[14px] text-arcg-graphite">
                {cap.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-[7px] inline-block w-1 h-1 rounded-full bg-arcg-river shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-4 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.12em] uppercase text-arcg-ink-muted">
                <span
                  className="inline-block w-[5px] h-[5px] rounded-full"
                  style={{ background: cap.featured ? "#B4232A" : "#C9A227" }}
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
