import { CONTACT_EMAIL } from "./contact";

/**
 * Canonical deployment URL — used for absolute links that MUST be absolute:
 * canonical tags, Open Graph/Twitter images, JSON-LD, robots, sitemap.
 * Update this when the site moves to a custom domain or the repo is renamed.
 */
export const SITE_URL = "https://becomingaman2000-ship-it.github.io/aurora-portfolio";
export const SITE_NAME = "Eustace Madawu — Software & Website Engineer";
export const PERSON_ID = `${SITE_URL}/#person`;

/**
 * Google Search Console ownership verification (HTML tag method).
 * Emitted as <meta name="google-site-verification"> in every page's <head>
 * via the root route. The matching verification file
 * (googled4758723af35bbb5.html) is also served from the site root via
 * /public. Keep both in place — Google re-checks periodically.
 */
export const GOOGLE_SITE_VERIFICATION = "googled4758723af35bbb5.html";

/**
 * Absolute URL for metadata (canonical, og:image, …). Accepts /-paths.
 * NOTE: SITE_URL already contains the deployment subpath (e.g. /<repo>/), so
 * this must NOT add the vite base on top — just join plainly.
 */
export function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Canonical link tag object for a route's head(). Root "/": bare SITE_URL. */
export const canonical = (path: string) => ({
  rel: "canonical",
  href: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
});

export const KNOWS_ABOUT = [
  "Software Engineering",
  "Website Engineering",
  "Web Development",
  "Full-Stack Development",
  "React",
  "TypeScript",
  "Node.js",
  "E-Commerce",
  "Product Design",
  "Database Design",
  "Payment Integration",
  "Cloud Deployment",
  "Counselling",
  "Event Management",
  "Technopreneurship",
];

const SHARED_LINKS = [
  "https://github.com/becomingaman2000-ship-it",
  "https://becomingaman2000-ship-it.github.io/hitarnav/",
];

/** Person JSON-LD — the entity card Google/AI engines use to answer "who is…". */
export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Eustace Madawu",
    url: SITE_URL,
    image: absUrl("/assets/profile-main.jpg"),
    email: `mailto:${CONTACT_EMAIL}`,
    jobTitle: "Freelance Software & Website Engineer",
    description:
      "Freelance software & website engineer, technopreneur, trained counsellor and event organiser from Harare, Zimbabwe. Designs, builds and ships full-stack websites, web apps and products for clients worldwide.",
    nationality: "Zimbabwean",
    homeLocation: { "@type": "Place", name: "Harare, Zimbabwe" },
    address: { "@type": "PostalAddress", addressLocality: "Harare", addressCountry: "ZW" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Harare Institute of Technology" },
    hasOccupation: {
      "@type": "Occupation",
      name: "Freelance Software & Website Engineer",
      occupationalCategory: "15-1252.00",
      occupationLocation: { "@type": "Country", name: "Worldwide (remote)" },
      skills: KNOWS_ABOUT.join(", "),
    },
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["English", "Shona", "Mandarin"],
    sameAs: SHARED_LINKS,
  };
}

/** WebSite entity tied to the person. */
export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Portfolio of Eustace Madawu — freelance software & website engineer available for hire worldwide.",
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
  };
}

/** FAQPage JSON-LD — pairs with the visible FAQ section (AEO). */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** ProfessionalService JSON-LD — makes the "hire me" intent machine-readable. */
export function professionalServiceJsonLd() {
  return {
    "@type": "ProfessionalService",
    name: "Eustace Madawu — Software & Website Engineering",
    url: `${SITE_URL}/services`,
    provider: { "@id": PERSON_ID },
    areaServed: "Worldwide (remote)",
    priceRange: "Project-based quote",
    description:
      "Freelance website engineering, software engineering and product design: marketing sites, e-commerce, full-stack web apps, databases and payments — designed, built, shipped and maintained.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Engineering services",
      itemListElement: [
        "Website engineering",
        "Software engineering",
        "Product design & MVP builds",
        "Data & business intelligence",
      ].map((s, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: { "@type": "Service", name: s },
      })),
    },
  };
}
