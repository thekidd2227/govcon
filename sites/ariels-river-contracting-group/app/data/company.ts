export const COMPANY = {
  legalName: "Ariel's River Contracting Group, LLC",
  // Display brand / DBA — used in nav, footer, social. The "Ariel's River" portion
  // of the legal name is intentionally not surfaced as a display brand.
  shortName: "ARCG",
  acronym: "ARCG",
  address: {
    street: "5601 Parker House Terrace, Suite 412",
    city: "Hyattsville",
    state: "MD",
    zip: "20782",
  },
  website: "www.arivergroup.com",
  websiteUrl: "https://www.arivergroup.com",
  email: "info@arivergroup.com",
  phone: "347.285.5750",
  phoneE164: "+13472855750",
  contact: {
    name: "ARCG Systems",
    title: "Contracting & Operations",
  },
  identifiers: {
    uei: "KPHJM83ZJLJ4",
    duns: "117331260",
    cage: "8FJ78",
  },
  certifications: ["SDVOSB", "HUBZone", "DBE", "MBE", "SBE", "NMSDC MBE"] as const,
} as const;

export const COMPANY_ADDRESS_INLINE = `${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}`;
