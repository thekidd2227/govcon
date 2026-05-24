import { COMPANY } from "../data/company";
import { CtaButton } from "../components/CtaButton";
import { HeroDiagram } from "../components/HeroDiagram";

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ink-muted flex flex-wrap gap-x-3 gap-y-1">
              {COMPANY.certifications.map((c, i) => (
                <span key={c} className="flex items-center gap-3">
                  {i > 0 && <span className="text-arcg-red">·</span>}
                  {c}
                </span>
              ))}
            </div>
            <h1 className="mt-7 font-display text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.02em] text-arcg-navy">
              Execution-Ready Support for Government and Commercial Facilities.
            </h1>
            <p className="mt-7 text-[18px] lg:text-[20px] leading-[1.5] text-arcg-graphite max-w-[640px]">
              {COMPANY.legalName} is a Service-Disabled Veteran-Owned Small Business
              delivering pest control, language access, staffing, janitorial, and
              emergency support services with reliability, compliance, and scalable
              execution.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaButton href="#contact" variant="primary">
                Request Capabilities Call →
              </CtaButton>
              <CtaButton href="/capability-statement.pdf" variant="secondary">
                View Capability Statement
              </CtaButton>
            </div>
            <dl className="mt-10 pt-6 border-t border-[var(--arcg-line)] font-mono text-[12px] text-arcg-ink-muted flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <dt className="opacity-70">UEI</dt>
                <dd className="text-arcg-graphite">{COMPANY.identifiers.uei}</dd>
              </div>
              <div>
                <dt className="opacity-70">CAGE</dt>
                <dd className="text-arcg-graphite">{COMPANY.identifiers.cage}</dd>
              </div>
              <div>
                <dt className="opacity-70">DUNS</dt>
                <dd className="text-arcg-graphite">{COMPANY.identifiers.duns}</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-[var(--arcg-line-strong)] bg-arcg-ivory p-4 lg:p-6 shadow-[0_1px_0_0_rgba(11,31,51,0.04)]">
              <HeroDiagram />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
