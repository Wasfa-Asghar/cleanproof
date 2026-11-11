import "./marketing.css";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { CookieConsent } from "@/components/marketing/cookie-consent";
import { MarketingPageFaq } from "@/components/marketing/marketing-page-faq";
import { MarketingMotion } from "@/components/marketing/marketing-motion";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="marketing-shell flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        {children}
        <MarketingPageFaq />
      </main>
      <SiteFooter />
      <CookieConsent />
      <MarketingMotion />
    </div>
  );
}
