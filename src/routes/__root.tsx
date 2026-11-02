import * as React from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import AppHeader from "../components/layout/AppHeader";
import { AppStateProvider } from "../features/app-state";

import appCss from "../styles.css?url";

const LazyDevtools = React.lazy(() =>
  Promise.all([
    import("@tanstack/react-devtools"),
    import("@tanstack/react-router-devtools"),
  ]).then(([devtools, routerDevtools]) => ({
    default: () => (
      <devtools.TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <routerDevtools.TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    ),
  }))
);

function ClientDevtools() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !import.meta.env.DEV) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <LazyDevtools />
    </React.Suspense>
  );
}

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="font-serif text-3xl font-bold text-parchment-gold">404 - Not Found</h1>
      <p className="mt-2 text-sm text-text-secondary">The requested chamber does not exist.</p>
    </div>
  ),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=5",
      },
      {
        title: "RuneDice — Roll Your Fate",
      },
      {
        name: "description",
        content:
          "Arcane minimalist D&D dice rolling companion with sessions, players, and cryptosafe fairness.",
      },
      {
        name: "theme-color",
        content: "#290044",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700;6..96,900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-canvas-base text-text-primary font-sans antialiased selection:bg-mystic-magenta selection:text-text-primary">
        <AppStateProvider>
          <AppHeader />
          <main className="min-h-[calc(100vh-65px)]">{children}</main>
        </AppStateProvider>
        <ClientDevtools />
        <Scripts />
      </body>
    </html>
  );
}
