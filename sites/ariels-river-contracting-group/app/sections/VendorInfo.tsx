import { SectionEyebrow } from "../components/SectionEyebrow";
import { COMPANY, COMPANY_ADDRESS_INLINE } from "../data/company";

const ROWS: { label: string; value: string; mono?: boolean; accent: "red" | "river" }[] = [
  { label: "Legal Name", value: COMPANY.legalName, accent: "red" },
  { label: "UEI", value: COMPANY.identifiers.uei, mono: true, accent: "river" },
  { label: "DUNS", value: COMPANY.identifiers.duns, mono: true, accent: "red" },
  { label: "CAGE Code", value: COMPANY.identifiers.cage, mono: true, accent: "river" },
  { label: "Address", value: COMPANY_ADDRESS_INLINE, accent: "red" },
  { label: "Website", value: COMPANY.website, accent: "river" },
  { label: "Email", value: COMPANY.email, accent: "red" },
  { label: "Phone", value: COMPANY.phone, mono: true, accent: "river" },
];

export function VendorInfo() {
  return (
    <section id="vendor-info" className="border-b border-arcg-navy/10">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow index="05" label="Vendor Info" />
        <h2 className="section-title mt-6">Vendor Information.</h2>
        <div className="mt-10 border border-arcg-navy/22 bg-arcg-ivory">
          <dl className="divide-y divide-arcg-navy/10">
            {ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 px-6 py-5 relative"
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 ${
                    row.accent === "red" ? "bg-arcg-red" : "bg-arcg-river"
                  }`}
                />
                <dt className="sm:col-span-3 font-mono text-[11px] tracking-[0.18em] uppercase text-arcg-steel self-center pl-3">
                  {row.label}
                </dt>
                <dd
                  className={`sm:col-span-9 text-[15px] text-arcg-navy ${
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
