import Link from "next/link";
import { businessIdentity, formatBusinessField } from "@/lib/config/business-identity";
import { MarketingWordmark } from "@/components/marketing/marketing-wordmark";

export function SiteFooter() {
  return (
    <footer className="marketing-footer mt-auto bg-[var(--cp-footer)] text-white">
      <div className="mx-auto max-w-[1216px] px-4 py-14 sm:px-5">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.1fr)_repeat(3,minmax(0,1fr))] lg:gap-11">
          <div className="sm:col-span-2 lg:col-span-1">
            <MarketingWordmark href="/" variant="light" />
            <p className="mt-4 max-w-[330px] text-sm leading-relaxed text-[#b6ced2]">
              Cleaning quality control, job verification and client reporting software for professional cleaning teams.
            </p>
            <p className="mt-3 text-xs text-[#91aab0]">A product of {businessIdentity.operatorName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Product</p>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link href="/features" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  All features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Product demo
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Company</p>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link href="/about" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/industries" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Industries
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Help centre
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link href="/privacy-policy" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/subscription-terms" className="text-[13px] text-[#bfd0d5] transition-colors hover:text-white">
                  Subscriptions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-[#36505b] pt-6 text-[11px] leading-relaxed text-[#91aab0]">
          <p>
            CleanProof is a software product of {businessIdentity.operatorName}, a company registered in {formatBusinessField(businessIdentity.registrationCountry)} (company number{" "}
            {formatBusinessField(businessIdentity.companyRegistrationNumber)}). Registered office: {formatBusinessField(businessIdentity.registeredAddress)}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {businessIdentity.copyrightYear} {businessIdentity.operatorName}. All rights reserved. ·{" "}
              <a href={`mailto:${businessIdentity.supportEmail}`} className="hover:text-white">
                {formatBusinessField(businessIdentity.supportEmail)}
              </a>{" "}
              ·{" "}
              <a href={`tel:${businessIdentity.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                {formatBusinessField(businessIdentity.supportPhone)}
              </a>
            </p>
            <p>thehouseofveynor.uk</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
