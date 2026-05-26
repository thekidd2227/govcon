import { COMPANY } from "../data/company";
import { CtaButton } from "../components/CtaButton";

export function FinalCta() {
  return (
    <section
      id="contact"
      className="bg-arcg-navy text-arcg-ivory relative overflow-hidden"
    >
      {/* tri-tone top accent */}
      <div className="h-[2px] flex" aria-hidden>
        <span className="w-1/3 bg-arcg-red" />
        <span className="w-1/3 bg-arcg-ivory/30" />
        <span className="w-1/3 bg-arcg-river" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" aria-hidden>
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="diag"
              patternUnits="userSpaceOnUse"
              width="48"
              height="48"
              patternTransform="rotate(35)"
            >
              <line x1="0" y1="0" x2="0" y2="48" stroke="#1FA6C9" strokeWidth="1" />
              <line x1="24" y1="0" x2="24" y2="48" stroke="#B4232A" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-24 lg:py-32">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ivory/80 flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-arcg-red" />
          <span className="inline-block w-6 h-px bg-arcg-river" />
          08 / Engage
        </div>
        <h2 className="mt-6 font-display text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] tracking-[-0.015em] max-w-[860px]">
          Built for Buyers Who Need Reliable Execution.
        </h2>
        <p className="mt-6 text-[18px] leading-[1.55] text-arcg-ivory/85 max-w-[640px]">
          ARCG supports government and commercial teams that need responsive service,
          compliance discipline, and dependable execution across facilities, language
          access, staffing, and emergency support requirements.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <CtaButton
            href={`mailto:${COMPANY.email}?subject=Capabilities%20Call%20Request`}
            variant="inverted"
          >
            Schedule Capabilities Call
          </CtaButton>
          <CtaButton href="/capability-statement.pdf" variant="inverted">
            Download Capability Statement
          </CtaButton>
          {/* Public CTA labels intentionally use ARCG brand, not personal names. */}
          <CtaButton href={`mailto:${COMPANY.email}`} variant="inverted">
            Contact ARCG
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
