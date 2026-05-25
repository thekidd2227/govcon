import { COMPANY, COMPANY_ADDRESS_INLINE } from "../data/company";

export function Footer() {
  return (
    <footer className="bg-arcg-navy text-arcg-ivory relative">
      {/* tri-tone top accent — river-blue / ivory / red */}
      <div className="h-[2px] flex" aria-hidden>
        <span className="w-1/3 bg-arcg-river" />
        <span className="w-1/3 bg-arcg-ivory/30" />
        <span className="w-1/3 bg-arcg-red" />
      </div>
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-[36px] font-semibold tracking-[-0.02em] leading-none">
              ARCG
            </div>
            <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-river">
              Contracting Group
            </div>
            <p className="mt-5 text-[14px] text-arcg-ivory/85 max-w-xs leading-[1.55]">
              {COMPANY.legalName}
              <br />
              {COMPANY_ADDRESS_INLINE}
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-river">
              Contact
            </div>
            <div className="mt-3 text-[14px] text-arcg-ivory/90">
              <div>{COMPANY.contact.name}</div>
              <div className="text-arcg-ivory/70">{COMPANY.contact.title}</div>
              <div className="mt-3">
                <a href={`mailto:${COMPANY.email}`} className="hover:underline">
                  {COMPANY.email}
                </a>
              </div>
              <div>
                <a href={`tel:${COMPANY.phoneE164}`} className="hover:underline">
                  {COMPANY.phone}
                </a>
              </div>
              <div className="mt-1">
                <a href={COMPANY.websiteUrl} className="hover:underline">
                  {COMPANY.website}
                </a>
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-river">
              Vendor IDs
            </div>
            <dl className="mt-3 text-[14px] font-mono space-y-1 text-arcg-ivory/90">
              <div className="flex justify-between gap-3">
                <dt className="text-arcg-ivory/60">UEI</dt>
                <dd>{COMPANY.identifiers.uei}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-arcg-ivory/60">CAGE</dt>
                <dd>{COMPANY.identifiers.cage}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-arcg-ivory/60">DUNS</dt>
                <dd>{COMPANY.identifiers.duns}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-arcg-ivory/15 text-[12px] text-arcg-ivory/65 flex flex-col md:flex-row gap-2 md:justify-between">
          <span className="inline-flex items-center gap-3">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-arcg-red" />
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-arcg-river" />
            {COMPANY.website} is the registered web domain of {COMPANY.legalName}.
          </span>
        </div>
      </div>
    </footer>
  );
}
