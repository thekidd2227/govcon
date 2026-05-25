export type PastPerformanceItem = {
  id: string;
  client: string;
  location: string;
  category: string;
  scope: string;
};

export const PAST_PERFORMANCE: PastPerformanceItem[] = [
  {
    id: "va-mann-grandstaff",
    client: "Mann-Grandstaff VA Medical Center",
    location: "Spokane, WA",
    category: "Federal Healthcare",
    scope: "Federal healthcare facility support. Reference available on request.",
  },
  {
    id: "atl-green-light",
    client: "City of Atlanta — Green Light Project",
    location: "Atlanta, GA",
    category: "Municipal Facilities",
    scope:
      "Cleaning and facility support services under a municipal cleaning agreement, with executed purchase orders and technical proposals on file. Reference available on request.",
  },
  {
    id: "atl-dpw",
    client: "City of Atlanta — Department of Public Works",
    location: "Atlanta, GA",
    category: "Municipal Operations",
    scope:
      "Operational support services for a municipal public works engagement. Reference available on request.",
  },
];
