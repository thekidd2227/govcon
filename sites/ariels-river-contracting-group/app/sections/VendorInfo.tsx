import { SectionEyebrow } from "../components/SectionEyebrow";
import { COMPANY, COMPANY_ADDRESS_INLINE } from "../data/company";

const ROWS: { label: string; value: string; mono?: boolean }[] = [
  { label: "Legal Name", value: COMPANY.legalName },
  { label: "UEI", value: COMPANY.identifiers.uei, mono: true },
  { label: "DUNS", value: COMPANY.identifiers.duns, mono: true },
  { label: "CAGE Code", value: COMPANY.identifiers.cage, mono: true },
  { label: "Address", value: COMPANY_ADDRESS_INLINE },
  { label: "Website", value: COMPANY.website },
  { label: "Email", value: COMPANY.email },
  { label: "Phone", value: COMPANY.phone, mono: true },
];

export function VendorInfo() {
  return (
    <section id="vendor-info" className="border-b border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="05" label="Vendor Info" />
        <h2 className="section-title mt-6">Vendor Information.</h2>
        <div className="mt-10 border border-[var(--arcg-line-strong)] bg-arcg-ivory">
          <dl className="divide-y divide-[var(--arcg-line)]">
            {ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 px-6 py-5"
              >
                <dt className="sm:col-span-3 font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-ink-muted self-center">
                  {row.label}
                </dt>
                <dd
                  className={`sm:col-span-9 text-[15px] text-arcg-graphite ${
                    row.mono ? "font-mono" : ""
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
