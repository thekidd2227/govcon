import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "inverted";

type Props = {
  href?: string;
  variant?: Variant;
  children: React.ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children">;

export function CtaButton({ href = "#", variant = "primary", children, className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 text-[15px] font-semibold tracking-[0.01em] transition-colors border";
  const styles: Record<Variant, string> = {
    primary:
      "bg-arcg-navy text-arcg-ivory border-arcg-navy hover:bg-[#0F2A45] hover:border-[#0F2A45]",
    secondary:
      "bg-transparent text-arcg-navy border-arcg-navy hover:bg-arcg-navy hover:text-arcg-ivory",
    inverted:
      "bg-arcg-ivory text-arcg-navy border-arcg-ivory hover:bg-transparent hover:text-arcg-ivory",
  };
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
