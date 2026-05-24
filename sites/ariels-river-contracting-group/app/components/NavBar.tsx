import Link from "next/link";
import { COMPANY } from "../data/company";
import { CtaButton } from "./CtaButton";

const NAV = [
  { href: "/", label: "Home" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#certifications", label: "Certifications" },
  { href: "#past-performance", label: "Past Performance" },
  { href: "#vendor-info", label: "Vendor Info" },
  { href: "#contact", label: "Contact" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 bg-arcg-ivory/95 backdrop-blur border-b border-[var(--arcg-line)]">
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 flex items-center justify-between h-16">
        <Link href="/" className="font-display text-[20px] font-medium tracking-[-0.015em] text-arcg-navy">
          {COMPANY.shortName}
          <span className="ml-2 font-mono text-[10px] tracking-[0.12em] uppercase text-arcg-ink-muted align-middle">
            {COMPANY.acronym}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-arcg-graphite">
          {NAV.slice(1, -1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-arcg-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <CtaButton href="#contact" variant="primary" className="hidden sm:inline-flex">
          Request Capabilities Call
        </CtaButton>
      </div>
    </header>
  );
}
