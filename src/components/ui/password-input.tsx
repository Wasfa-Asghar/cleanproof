"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Password field that is always masked by default.
 * The value is only revealed while the user explicitly presses the eye toggle.
 */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "w-full rounded-lg border border-[var(--cp-border)] bg-white py-2.5 pl-3 pr-11 text-[15px] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-[var(--cp-muted)] transition-colors hover:text-[var(--cp-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cp-teal)]"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
      </button>
    </div>
  );
}
