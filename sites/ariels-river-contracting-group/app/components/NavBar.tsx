import Link from "next/link";
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
    <header className="sticky top-0 z-40 bg-arcg-ivory/95 backdrop-blur border-b border-arcg-navy/10">
      {/* tri-tone accent strip — red / ivory / river-blue */}
      <div className="h-[2px] flex" aria-hidden>
        <span className="w-1/3 bg-arcg-red" />
        <span className="w-1/3 bg-arcg-ivory" />
        <span className="w-1/3 bg-arcg-river" />
      </div>
      <div className="mx-auto max-w-[var(--container-content)] px-6 lg:px-10 flex items-center justify-between h-16">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 text-arcg-navy"
          aria-label="ARCG home"
        >
          <span className="font-display text-[24px] font-semibold tracking-[-0.02em] leading-none">
            ARCG
          </span>
          <span className="hidden sm:inline-block w-px h-5 bg-arcg-navy/25" aria-hidden />
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] uppercase text-arcg-steel">
            Contracting Group
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-arcg-navy/85">
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
