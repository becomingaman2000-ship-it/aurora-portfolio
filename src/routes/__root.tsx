import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { assetUrl } from "../lib/asset";
import { SITE_URL, GOOGLE_SITE_VERIFICATION, personJsonLd, websiteJsonLd } from "../lib/site";
import { AuroraBackground } from "../components/AuroraBackground";
import { ScrollStroke, type StrokeVariant } from "../components/ScrollStroke";
import { ScrollDissolve } from "../components/ScrollDissolve";
import { Nav } from "../components/Nav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-6xl font-bold text-gradient">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">This page drifted into the aurora.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[root error boundary]", error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">Something drifted off course</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing the page.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1",
      },
      // Google Search Console verification (HTML tag method) — on every route.
      { name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION },
      { title: "Eustace .T. Madawu — Freelance Software & Website Engineer" },
      {
        name: "description",
        content:
          "Hire Eustace .T. Madawu — freelance software & website engineer from Harare, Zimbabwe, working remotely worldwide. Websites, web apps and full-stack products designed, built and shipped.",
      },
      { name: "author", content: "Eustace .T. Madawu" },
      { property: "og:site_name", content: "Eustace .T. Madawu — Portfolio" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Eustace .T. Madawu — Freelance Software & Website Engineer" },
      {
        property: "og:description",
        content:
          "Full-stack websites, software systems, and product design. Available for freelance engagements worldwide.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/assets/profile-main.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Eustace .T. Madawu — Freelance Software & Website Engineer" },
      {
        name: "twitter:description",
        content:
          "Freelance software & website engineer from Harare, Zimbabwe — available for hire worldwide.",
      },
      { name: "twitter:image", content: `${SITE_URL}/assets/profile-main.jpg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: assetUrl("/favicon.ico"), type: "image/x-icon" },
      { rel: "apple-touch-icon", href: assetUrl("/apple-touch-icon.png") },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [personJsonLd(), websiteJsonLd()],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const STROKE_BY_PATH: Record<string, StrokeVariant> = {
  "/": "ribbon",
  "/about": "orbit",
  "/services": "wave",
  "/projects": "zigzag",
  "/leadership": "arc",
  "/contact": "spiral",
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const variant = STROKE_BY_PATH[pathname] ?? "wave";

  return (
    <QueryClientProvider client={queryClient}>
      <AuroraBackground />
      <Nav />
      <main className="pt-28 md:pt-24 pb-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
        <ScrollStroke key={pathname} variant={variant}>
          <ScrollDissolve key={pathname}>
            <Outlet />
          </ScrollDissolve>
        </ScrollStroke>
      </main>
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Eustace .T. Madawu · Harare, Zimbabwe
      </footer>
    </QueryClientProvider>
  );
}
