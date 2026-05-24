export type Capability = {
  id: string;
  index: string;
  title: string;
  naics: string;
  bullets: string[];
  featured?: boolean;
};

export const CAPABILITIES: Capability[] = [
  {
    id: "pest-control",
    index: "01",
    title: "Pest Control & Extermination",
    naics: "561710",
    featured: true,
    bullets: [
      "Rodent control",
      "Termite extermination",
      "Insect management",
      "Eco-friendly pest strategies",
      "Facility-safe treatment plans",
    ],
  },
  {
    id: "translation",
    index: "02",
    title: "Translation & Interpretation",
    naics: "541930",
    bullets: [
      "ASL interpretation",
      "CART reporting",
      "Remote and on-site language access",
      "ADA-conscious communication support",
      "Cross-cultural communication",
    ],
  },
  {
    id: "staffing",
    index: "03",
    title: "Staffing & Operational Support",
    naics: "561312 / 561320",
    bullets: [
      "Executive search",
      "Temporary help services",
      "Administrative support",
      "Program staffing coordination",
    ],
  },
  {
    id: "janitorial",
    index: "04",
    title: "Janitorial & Facility Support",
    naics: "561720",
    bullets: [
      "Facility cleaning",
      "Site readiness",
      "Health and safety support",
      "Commercial and government facility support",
    ],
  },
  {
    id: "emergency",
    index: "05",
    title: "Emergency & Relief Services",
    naics: "624230",
    bullets: [
      "Rapid mobilization",
      "Mission support",
      "Response coordination",
      "Continuity-focused service delivery",
    ],
  },
];

export const DIFFERENTIATORS = [
  {
    title: "Certified SDVOSB Execution Partner",
    body: "Verified veteran-owned status with the discipline procurement teams expect.",
  },
  {
    title: "Eco-Friendly & Compliant Methods",
    body: "Treatment and cleaning protocols built around facility safety and environmental standards.",
  },
  {
    title: "Scalable Delivery",
    body: "Right-sized for micro-purchase actions and simplified acquisitions through enterprise contracts.",
  },
  {
    title: "Language Access & ADA Support",
    body: "ASL, CART, and multilingual coverage on-site and remote.",
  },
  {
    title: "Procurement-Aligned Documentation",
    body: "Capability statement, vendor identifiers, and certifications maintained current.",
  },
  {
    title: "Reliable, Client-Centered Execution",
    body: "On-time delivery with a single point of accountability.",
  },
];
