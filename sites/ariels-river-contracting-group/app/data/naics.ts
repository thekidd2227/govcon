export type NaicsEntry = { code: string; label: string };

export const NAICS_PRIMARY: NaicsEntry = {
  code: "561710",
  label: "Exterminating & Pest Control Services",
};

export const NAICS_SECONDARY: NaicsEntry[] = [
  { code: "541930", label: "Translation & Interpretation Services" },
  { code: "561312", label: "Executive Search Services" },
  { code: "561320", label: "Temporary Help Services" },
  { code: "561720", label: "Janitorial Services" },
  { code: "624230", label: "Emergency & Other Relief Services" },
];
