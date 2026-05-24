import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { COMPANY, COMPANY_ADDRESS_INLINE } from "./data/company";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${COMPANY.legalName} — SDVOSB Government Contractor`,
  description:
    "SDVOSB delivering pest control, language access, staffing, janitorial, and emergency relief services to government and commercial facilities.",
  alternates: { canonical: COMPANY.websiteUrl },
  openGraph: {
    title: COMPANY.legalName,
    description: "Execution-ready support for government and commercial facilities.",
    url: COMPANY.websiteUrl,
    siteName: COMPANY.legalName,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  legalName: COMPANY.legalName,
  name: COMPANY.shortName,
  alternateName: COMPANY.acronym,
  url: COMPANY.websiteUrl,
  email: COMPANY.email,
  telephone: COMPANY.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    addressRegion: COMPANY.address.state,
    postalCode: COMPANY.address.zip,
    addressCountry: "US",
  },
  identifier: [
    { "@type": "PropertyValue", propertyID: "UEI", value: COMPANY.identifiers.uei },
    { "@type": "PropertyValue", propertyID: "CAGE", value: COMPANY.identifiers.cage },
    { "@type": "PropertyValue", propertyID: "DUNS", value: COMPANY.identifiers.duns },
  ],
  description: `SDVOSB government contractor providing pest control, language access, staffing, janitorial, and emergency relief services. ${COMPANY_ADDRESS_INLINE}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-arcg-ivory text-arcg-graphite">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
