import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-sky-700 text-white hover:bg-sky-800 border border-sky-800",
  secondary: "bg-white text-slate-900 hover:bg-slate-50 border border-slate-300",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger: "bg-rose-700 text-white hover:bg-rose-800 border border-rose-800",
};

export function Button({
  children,
  className,
  variant = "primary",
  href,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
}) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50",
    variants[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
