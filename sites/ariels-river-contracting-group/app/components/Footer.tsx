import { COMPANY, COMPANY_ADDRESS_INLINE } from "../data/company";

export function Footer() {
  return (
    <footer className="bg-arcg-navy text-arcg-ivory">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-[24px] font-medium tracking-[-0.015em]">
              {COMPANY.shortName}
            </div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.12em] uppercase opacity-70">
              {COMPANY.acronym}
            </div>
            <p className="mt-4 text-[14px] opacity-80 max-w-xs">
              {COMPANY.legalName}
              <br />
              {COMPANY_ADDRESS_INLINE}
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-70">
              Contact
            </div>
            <div className="mt-3 text-[14px]">
              <div>{COMPANY.contact.name}</div>
              <div className="opacity-80">{COMPANY.contact.title}</div>
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
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-70">
              Vendor IDs
            </div>
            <dl className="mt-3 text-[14px] font-mono space-y-1">
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">UEI</dt>
                <dd>{COMPANY.identifiers.uei}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">CAGE</dt>
                <dd>{COMPANY.identifiers.cage}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">DUNS</dt>
                <dd>{COMPANY.identifiers.duns}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-arcg-ivory/15 text-[12px] opacity-70 flex flex-col md:flex-row gap-2 md:justify-between">
          <span>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</span>
          <span>{COMPANY.website} is the registered web domain of {COMPANY.legalName}.</span>
        </div>
      </div>
    </footer>
  );
}
