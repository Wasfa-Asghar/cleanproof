import { businessIdentity } from "@/lib/config/business-identity";

export type LegalSection = { id: string; title: string; paragraphs: string[] };

export type LegalDocument = {
  slug: string;
  title: string;
  sections: LegalSection[];
};

const company = businessIdentity.operatorName;
const email = businessIdentity.supportEmail;
const regNo = businessIdentity.companyRegistrationNumber;
const address = businessIdentity.registeredAddress;
const country = businessIdentity.registrationCountry;

const contactLine = `You can contact us at ${email}, or write to ${company}, ${address}.`;
const companyLine = `CleanProof is a product of ${company}, a company registered in ${country} with company number ${regNo}. Our registered office is ${address}.`;

function doc(slug: string, title: string, sections: LegalSection[]): LegalDocument {
  return { slug, title, sections };
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  "privacy-policy": doc("privacy-policy", "Privacy Policy", [
    {
      id: "who-we-are",
      title: "Who we are",
      paragraphs: [
        `This policy explains how personal information is used when you visit our website or use the CleanProof software. ${companyLine}`,
        `For the information in this policy that we decide how to use (website visitors, account holders and billing contacts), ${company} is the controller under the UK GDPR and the Data Protection Act 2018. ${contactLine}`,
        "CleanProof is built for businesses. For the cleaning records, staff details and photos that a customer puts into CleanProof, the customer is the controller and we act as their processor. That relationship is covered by our Data Processing Agreement.",
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      paragraphs: [
        "Account details: your name, work email address, password (stored only as a one way hash), organisation name, and your role in the organisation.",
        "Information about your use of the service: the clients, sites, jobs, checklists, review decisions, issues and reports your organisation creates, along with the staff names and email addresses your organisation adds.",
        "Photos and files: before and after photos uploaded for jobs, together with the time, the uploader and the job they belong to.",
        "Billing information: your plan, usage against plan limits, and the history of payments. Card and bank details are entered on the payment page of our payment provider. We never see or store full card numbers.",
        "Website enquiries: the name, email address, company, country and message you send through our contact form, or in an email to us.",
        "Technical information: sign in events, security and audit logs, and the cookies described in our Cookie Policy.",
      ],
    },
    {
      id: "why-we-use-it",
      title: "Why we use it and our legal basis",
      paragraphs: [
        "To provide the service you signed up for, including running your account, sending operational emails such as password resets and billing notices, and taking payment. Our legal basis is performing our contract with you or your organisation.",
        "To keep the service secure, prevent misuse, fix faults and keep records of important actions. Our legal basis is our legitimate interest in running a safe and reliable service.",
        "To answer your enquiries and, where you are a business contact, to tell you about changes to the service. Our legal basis is our legitimate interest in running our business. You can ask us to stop sending anything that is not essential to the service.",
        "To meet legal duties such as tax and accounting records. Our legal basis is legal obligation.",
        "We do not sell personal information and we do not use it for advertising.",
      ],
    },
    {
      id: "who-we-share-with",
      title: "Who we share it with",
      paragraphs: [
        "We use a small number of service providers to run CleanProof. They act on our instructions and only receive what they need. They fall into these groups: payment processing (Mollie B.V.), cloud hosting and database services, file storage for photos, and email delivery.",
        `If you would like the names of the providers we use at any time, email ${email} and we will tell you.`,
        "Within your organisation, information is visible according to roles. Owners, managers and cleaners see different things. If you share a completion report with a client, that person can open the approved report through a private link until the link expires or is removed.",
        "We may disclose information where the law requires it, or to protect our rights, our users or the public.",
      ],
    },
    {
      id: "transfers",
      title: "Transfers outside the UK",
      paragraphs: [
        "Some of our providers may process information outside the UK. Where that happens, we make sure the transfer is protected, for example by relying on UK adequacy regulations or by using the ICO's International Data Transfer Agreement or the UK Addendum to the EU standard contractual clauses.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      paragraphs: [
        "We keep account and organisation data for as long as the account is open. When an account ends, you can ask us in writing to delete or return your organisation's data, and we will do so within 30 days unless the law requires us to keep something.",
        "We keep billing and tax records for the period required by UK law, which is currently at least six years. Website enquiries are kept for as long as needed to deal with them and for a reasonable time afterwards.",
        "Password reset links work for one hour and can be used once.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      paragraphs: [
        "You can ask us for a copy of your personal information, ask us to correct it, ask us to delete it, ask us to restrict or stop using it, and in some cases ask us to give it to you in a portable format. You can also object to use that relies on legitimate interests.",
        `To use any of these rights, email ${email}. We will reply within one month. If your information was added by an organisation that uses CleanProof, such as your employer, we may need to pass your request to that organisation because it is the controller.`,
        "If you are unhappy with how we have handled your information, you can complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113. We would appreciate the chance to put things right first.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "Access is limited by role and by organisation, passwords are hashed, files are served only to authorised users, and important actions are logged. No online service can promise perfect security, so we also limit the information we collect to what the service needs.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: ["CleanProof is for businesses and is not aimed at anyone under 18. We do not knowingly collect information from children."],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "If we make a significant change we will update the date on this page and, for account holders, tell you by email before the change takes effect.",
      ],
    },
  ]),

  terms: doc("terms", "Terms of Service", [
    {
      id: "about",
      title: "About these terms",
      paragraphs: [
        `These terms are an agreement between ${company} ("we", "us") and the business that creates a CleanProof account ("you"). ${companyLine}`,
        "CleanProof is for business use only. By creating an account or using the service you confirm that you are acting for a business and that you have authority to accept these terms for it. These terms, together with our Privacy Policy, Acceptable Use Policy, Subscription Terms, Refund and Cancellation Policy and Data Processing Agreement, are the whole agreement between us about the service.",
      ],
    },
    {
      id: "service",
      title: "The service",
      paragraphs: [
        "CleanProof is online software that helps cleaning businesses assign jobs, complete checklists, capture photo evidence, review quality, track issues and share completion reports with their clients.",
        "We provide the software only. We do not carry out cleaning work and we are not a party to any contract between you and your own clients or staff. You stay responsible for the quality of your services, for what you tell your clients, and for complying with the laws that apply to your business.",
        "We may improve, change or remove features from time to time. If we remove a feature that matters to you in a way that makes the service materially worse, we will give you reasonable notice.",
      ],
    },
    {
      id: "accounts",
      title: "Your account and users",
      paragraphs: [
        "You must give accurate information when you register and keep it up to date. Keep passwords private and tell us promptly if you think an account has been accessed without permission.",
        "You are responsible for everything done under your organisation's accounts, including by the owners, managers and cleaners you add. Make sure each person you add has a right to use the service for your business and has been told how their information is used.",
      ],
    },
    {
      id: "trial",
      title: "Free trial",
      paragraphs: [
        "New organisations get a 14 day free trial of CleanProof. You do not need to give payment details to start it. When the trial ends, you can choose a paid plan to keep full access. If you do not, the account becomes read only for features covered by plan limits, and you can still view and export your data.",
      ],
    },
    {
      id: "fees",
      title: "Fees and payment",
      paragraphs: [
        "Prices are shown on our Pricing page in pounds sterling. Paid plans are billed monthly in advance by card or another method offered at checkout through our payment provider, Mollie. By subscribing you authorise us to collect the plan price each month until you cancel.",
        "If we are required to charge VAT, we will add it at the rate that applies and show it on your invoice or receipt.",
        "If a payment fails, we will tell you and our payment provider may try again. If payment is still outstanding after a short grace period, we may restrict access to paid features until it is settled. You may also be liable for interest and costs on overdue amounts under the Late Payment of Commercial Debts (Interest) Act 1998.",
        "We may change our prices. We will give existing subscribers at least 30 days notice by email, and the new price will apply from your next billing date after that notice. If you do not want the new price, you can cancel before it takes effect.",
        "Upgrades, downgrades, cancellation and refunds are explained in our Subscription Terms and our Refund and Cancellation Policy.",
      ],
    },
    {
      id: "your-data",
      title: "Your data",
      paragraphs: [
        "You own the information you put into CleanProof, including your jobs, checklists, photos and reports. You give us a licence to host, copy and process that information only as needed to provide the service to you, and to keep it secure.",
        "Where that information includes personal data, we act as your processor and the Data Processing Agreement applies. You are responsible for having a lawful basis to put personal data into CleanProof, including photos that show people.",
        "You can export key records from your account settings while your account is open. After your account ends you can ask us in writing to return or delete your data, as described in the Data Processing Agreement.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "You must follow our Acceptable Use Policy. We may suspend an account that puts the service, other customers or other people at risk, and we will tell you why where we can.",
      ],
    },
    {
      id: "our-rights",
      title: "Our intellectual property",
      paragraphs: [
        "We and our licensors own the software, the CleanProof name and logo, and all rights in the service. While you have a subscription we give you a limited, non exclusive, non transferable right to use the service for your internal business purposes. You may not copy, resell or reverse engineer the software, except where the law allows it.",
      ],
    },
    {
      id: "availability",
      title: "Availability and support",
      paragraphs: [
        "We work to keep CleanProof available and to fix faults quickly, but we do not promise that it will be uninterrupted or error free. We may carry out maintenance, and some things, such as internet outages and problems at our providers, are outside our control. We do not offer a guaranteed uptime commitment or service credits under these terms.",
        `You can reach support at ${email}. Priority support is a feature of the Pro plan only as described on the Pricing page.`,
        "Photo and offline upload features depend on the device and network you use. You are responsible for checking that your cleaners' uploads have been received before relying on them.",
      ],
    },
    {
      id: "warranties",
      title: "Warranties",
      paragraphs: [
        "We promise to provide the service with reasonable skill and care. Apart from that, and to the extent the law allows, we give no other promises about the service, including that it will meet your particular needs or that it will satisfy your clients or any inspection, audit, contract or regulation.",
      ],
    },
    {
      id: "liability",
      title: "Our liability",
      paragraphs: [
        "Nothing in these terms limits or excludes liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited or excluded by law.",
        "Subject to that, we are not liable to you, whether in contract, tort (including negligence) or otherwise, for any loss of profit, revenue, business, contracts, goodwill or anticipated savings, or for any indirect or consequential loss. We are also not liable for losses caused by your clients' decisions, by information you enter wrongly, or by events outside our reasonable control.",
        "Subject to the first paragraph of this section, our total liability to you for all claims arising from or connected with the service in any 12 month period is limited to the fees you paid us for the service in the 12 months before the event that gave rise to the claim.",
        "These limits are part of the price you pay for the service. Both of us have had the chance to consider them and we believe they are reasonable.",
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality",
      paragraphs: [
        "Each of us will keep confidential any non public information of the other that we learn through the service, use it only for the purposes of these terms, and not disclose it except to people who need to know it, or where the law requires. This does not apply to information that is public through no fault of ours or that we already had or got lawfully elsewhere.",
      ],
    },
    {
      id: "term",
      title: "Duration and ending the agreement",
      paragraphs: [
        "These terms start when you create an account and continue until the account is closed. You can cancel at any time from the billing page, and your plan then runs until the end of the period you have paid for.",
        "We can end the agreement by giving you at least 30 days notice by email. We can end it or suspend the account immediately if you seriously or repeatedly break these terms, do not pay when due and do not put that right after a reminder, or if we are required to by law.",
        "When the agreement ends, your right to use the service ends. Sections that are meant to continue, such as liability, confidentiality and governing law, continue after it ends.",
      ],
    },
    {
      id: "force-majeure",
      title: "Events outside our control",
      paragraphs: [
        "Neither of us is responsible for a delay or failure caused by something beyond our reasonable control, such as severe weather, power or internet failure, failure of a hosting or payment provider, strikes, war, or government action. Payment obligations for service already provided are not affected.",
      ],
    },
    {
      id: "general",
      title: "General",
      paragraphs: [
        "We may update these terms, for example to reflect changes to the service or the law. We will give you at least 30 days notice by email of any change that is not required by law, and if you continue to use the service after that date you accept the new terms. If you do not accept them you can cancel before they apply.",
        "You may not transfer your rights or duties under these terms without our written consent. We may transfer ours to a company that takes over the CleanProof business, and we will tell you if we do.",
        "These terms do not create a partnership, agency or employment relationship. Only you and we can enforce them, and no one else has any right to enforce them under the Contracts (Rights of Third Parties) Act 1999. If a part of these terms is found to be unenforceable, the rest stays in force. If we do not enforce a right straight away, we can still enforce it later.",
        `We will send notices to the email address on your account. You can send notices to us at ${email} or at ${address}.`,
      ],
    },
    {
      id: "law",
      title: "Governing law and courts",
      paragraphs: [
        "These terms and any dispute or claim connected with them or the service, including non contractual disputes, are governed by the law of England and Wales. The courts of England and Wales have exclusive jurisdiction.",
        "If you have a concern, please contact us first so we can try to sort it out.",
      ],
    },
  ]),

  "cookie-policy": doc("cookie-policy", "Cookie Policy", [
    {
      id: "what",
      title: "What cookies we use",
      paragraphs: [
        "Essential cookies: a session cookie that keeps you signed in to the CleanProof application. It is needed for the service to work, so it does not need your consent.",
        "Preference cookies: a small record of the cookie choice you make in the banner, so we do not ask you again on every visit.",
        "We do not load optional analytics or advertising cookies unless you agree to them.",
      ],
    },
    {
      id: "control",
      title: "Your choices",
      paragraphs: [
        "You can change your choice at any time with the cookie preferences button on the site. You can also block or delete cookies in your browser settings, but the application will not work without its essential cookie.",
      ],
    },
  ]),

  "refund-policy": doc("refund-policy", "Refund & Cancellation Policy", [
    {
      id: "cancel",
      title: "Cancelling",
      paragraphs: [
        "The owner of an organisation can cancel at any time from the billing page. Cancelling stops future monthly payments straight away. Your plan stays active until the end of the period you have already paid for, then the account moves to read only access and you can still view and export your data.",
        "If you change your mind before that period ends, you can reactivate from the same page and your monthly payments will restart from the end of the current period.",
      ],
    },
    {
      id: "refunds",
      title: "Refunds",
      paragraphs: [
        "CleanProof is sold to businesses, and the statutory cooling off rights that apply to consumers do not apply. Every new account gets a 14 day free trial so that you can decide whether the service suits you before you pay.",
        "Monthly payments are not refundable for a part of a month that has already started, and we do not give credit for unused time when you cancel or move to a cheaper plan.",
        `We will refund a payment in full if we took it by mistake, took it twice, or took it after you had cancelled in time. If you think this has happened, email ${email} with the date and amount and we will look into it promptly.`,
        "Refunds go back to the original payment method. Your bank or card provider may take several working days to show it.",
      ],
    },
    {
      id: "failed",
      title: "If something goes wrong with a payment",
      paragraphs: [
        `If a payment fails or you see a charge you do not recognise, please contact ${email} before raising a dispute with your bank so we can help quickly.`,
      ],
    },
  ]),

  "subscription-terms": doc("subscription-terms", "Subscription Terms", [
    {
      id: "plans",
      title: "Plans and limits",
      paragraphs: [
        "CleanProof is offered as Starter, Growth and Pro plans. Each plan has its own monthly price and its own limits on active cleaners, active sites and jobs per billing period. The current prices and limits are shown on the Pricing page and on the billing page in your account.",
        "You can see your usage against your limits at any time on the billing page. If you reach a limit, you will need to move to a larger plan to add more.",
      ],
    },
    {
      id: "trial",
      title: "Free trial",
      paragraphs: [
        "Every new organisation gets a 14 day free trial. No card is needed to start. If you do not choose a paid plan before the trial ends, your account becomes read only for features covered by plan limits.",
      ],
    },
    {
      id: "billing",
      title: "How billing works",
      paragraphs: [
        "When you choose a paid plan you are taken to the payment page of our provider, Mollie, to make your first payment. That payment covers the first month and gives us your permission to collect the same amount automatically every month on the same date until you cancel.",
        "Your billing period starts on the day of your first payment. Each month we collect the plan price and your period moves forward by one month. You will get an email confirming activation and a notice if a payment fails.",
      ],
    },
    {
      id: "changes",
      title: "Upgrades and downgrades",
      paragraphs: [
        "If you upgrade, you pay the full price of the new plan straight away. The new plan starts immediately, a new monthly billing period begins from that day, and your monthly payments continue at the new price. We do not work out a part refund or credit for the time left on your old plan.",
        "If you downgrade, the change takes effect at the end of your current billing period and the lower price applies from the next payment. You can only downgrade if your usage already fits within the limits of the smaller plan.",
      ],
    },
    {
      id: "failed",
      title: "Failed payments",
      paragraphs: [
        "If a monthly payment fails, our payment provider will try again over the following days and we will email the account owner. If payment is still outstanding after a short grace period of five days, the account is marked past due and paid features may be restricted until the payment goes through. Your data is not deleted because of a failed payment.",
      ],
    },
    {
      id: "cancel",
      title: "Cancelling",
      paragraphs: [
        "You can cancel at any time. See the Refund and Cancellation Policy for what happens to your access and your data.",
      ],
    },
    {
      id: "price-changes",
      title: "Price changes",
      paragraphs: [
        "We will give at least 30 days notice by email before a price change affects your subscription. You can cancel before the new price applies.",
      ],
    },
  ]),

  "acceptable-use": doc("acceptable-use", "Acceptable Use Policy", [
    {
      id: "rules",
      title: "How you may use CleanProof",
      paragraphs: [
        "Use CleanProof only for lawful work that relates to managing cleaning operations in your own business.",
        "Do not try to get into another customer's data, test or probe our systems without our written permission, interfere with the service or its security, or use automated tools that put unreasonable load on it.",
        "Do not upload viruses or other harmful code, and do not share your login with people outside your business. Report links are meant for the client they were created for, so please do not publish them.",
      ],
    },
    {
      id: "content",
      title: "What you upload",
      paragraphs: [
        "You are responsible for everything you upload. Make sure you have the right to use any photos, names and other personal information you add, and that the people involved have been told. Do not upload anything unlawful, defamatory, or that infringes someone else's rights.",
        "Take care with photos taken inside homes and workplaces. Avoid capturing people, documents or screens that are not needed to show the work that was done.",
      ],
    },
    {
      id: "enforcement",
      title: "If these rules are broken",
      paragraphs: [
        `We may remove content, suspend access or close an account that breaks this policy. Where it is safe and lawful to do so we will tell you what we found and give you a chance to put it right. To report a problem, email ${email}.`,
      ],
    },
  ]),

  "data-processing-agreement": doc("data-processing-agreement", "Data Processing Agreement", [
    {
      id: "scope",
      title: "About this agreement",
      paragraphs: [
        `This agreement applies between the customer organisation that uses CleanProof ("the Customer") and ${company}, company number ${regNo} ("CleanProof", "we"). It forms part of the Terms of Service and applies automatically when the Customer uses the service. It exists to meet Article 28 of the UK GDPR.`,
        "If there is a conflict between this agreement and the Terms of Service about personal data, this agreement applies.",
      ],
    },
    {
      id: "details",
      title: "Details of the processing",
      paragraphs: [
        "Subject matter: providing the CleanProof service to the Customer.",
        "Duration: for as long as the Customer has an account, and afterwards only for the period needed to return or delete data under this agreement.",
        "Nature and purpose: hosting, storing, displaying and transmitting information so that the Customer can manage jobs, checklists, photos, reviews, issues and client reports.",
        "Types of personal data: names, work email addresses and roles of the Customer's staff, names and contact details of the Customer's clients and their site contacts, site addresses, job records, notes, and photos that may show people.",
        "Whose data: the Customer's staff and the Customer's clients and their staff or visitors.",
      ],
    },
    {
      id: "roles",
      title: "Roles",
      paragraphs: [
        "For the information the Customer puts into CleanProof, the Customer is the controller and CleanProof is the processor. For our own account, billing, security and website information, CleanProof is a separate controller as set out in our Privacy Policy.",
        "The Customer is responsible for having a lawful basis for the processing, for telling the people concerned how their information is used, and for the instructions it gives us.",
      ],
    },
    {
      id: "our-duties",
      title: "What we agree to do",
      paragraphs: [
        "We will process the personal data only on the Customer's documented instructions, which are these terms and the Customer's use of the service, unless the law requires us to do otherwise. If we think an instruction breaks data protection law we will tell the Customer.",
        "We will make sure that everyone we allow to process the data is bound by confidentiality.",
        "We will keep the data secure with appropriate technical and organisational measures, including separation of each customer's data, role based access, hashed passwords, authenticated access to files and reports, and logging of important actions. The Security page describes them.",
        "We will help the Customer respond to requests from people exercising their rights, taking into account the nature of the processing. If a person contacts us directly about the Customer's data, we will pass the request to the Customer where we can identify them.",
        "We will help the Customer meet its duties on security, data protection impact assessments and consulting the ICO, taking into account the information we have.",
        "If we become aware of a personal data breach affecting the Customer's data, we will tell the Customer without undue delay, and give the details it reasonably needs to meet its own notification duties.",
      ],
    },
    {
      id: "subprocessors",
      title: "Sub-processors",
      paragraphs: [
        "The Customer gives general permission for us to use sub-processors for hosting, file storage, email delivery and payment processing. We will use only providers that give appropriate data protection guarantees, we will put a contract in place with each of them that requires the same level of protection as this agreement, and we remain responsible for their work.",
        `We will tell the Customer by email before adding or replacing a sub-processor that handles Customer personal data, and the Customer may object on reasonable data protection grounds within 14 days. If we cannot resolve the objection, the Customer may cancel without penalty. A current list of sub-processors is available on request at ${email}.`,
      ],
    },
    {
      id: "transfers",
      title: "International transfers",
      paragraphs: [
        "We will not transfer the personal data outside the UK unless the transfer is protected, for example by UK adequacy regulations or by the ICO's International Data Transfer Agreement or the UK Addendum.",
      ],
    },
    {
      id: "end",
      title: "When the agreement ends",
      paragraphs: [
        `When the Customer's account ends, the Customer can ask us in writing at ${email} to return or delete the personal data. We will do so within 30 days and delete existing copies, unless the law requires us to keep them. Customers can also export key records from their account settings at any time while the account is open.`,
      ],
    },
    {
      id: "audit",
      title: "Showing compliance",
      paragraphs: [
        "We will give the Customer the information it reasonably needs to show that we are meeting this agreement. The Customer may carry out an audit, or have one carried out by an independent auditor bound by confidentiality, on reasonable notice, no more than once a year unless a breach has happened, during working hours and without disrupting our other customers.",
      ],
    },
  ]),

  security: doc("security", "Security Overview", [
    {
      id: "implemented",
      title: "What we do",
      paragraphs: [
        "Role based access: owners, managers and cleaners can each see and do only what their role allows.",
        "Separation between customers: every request is checked against the signed in organisation, so one customer cannot see another customer's records.",
        "Sign in: sessions are checked on the server, passwords are stored only as one way hashes, and password reset links are single use and expire after one hour.",
        "Files and reports: photos are served only to authorised users, and client report links use private tokens that can expire or be removed.",
        "Payments: card details are entered on the payment page of our provider, Mollie, and are never stored by CleanProof.",
        "Records: significant job, review and billing actions are written to an audit log.",
      ],
    },
    {
      id: "not-claimed",
      title: "What we do not claim",
      paragraphs: [
        "We do not currently hold SOC 2 or ISO 27001 certification and have not published an independent penetration test. We will not claim either until it has been completed.",
        `If you find a security problem, please tell us at ${email}. We will look into every report.`,
      ],
    },
  ]),
};

export const LEGAL_SLUG_ALIASES: Record<string, string> = {
  privacy: "privacy-policy",
  dpa: "data-processing-agreement",
  refunds: "refund-policy",
  cookies: "cookie-policy",
  accessibility: "privacy-policy",
};
