import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { captureUtms } from "@/lib/utm";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página não existe ou foi movida. Continue explorando nossa coleção.
        </p>
        <div className="mt-6">
          <Button asChild><Link to="/">Voltar à loja</Link></Button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente ou volte à loja para continuar sua compra.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </Button>
          <Button asChild variant="outline"><a href="/">Voltar à loja</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mundo Natalino" },
      { name: "description", content: "Mundo Natalino: árvores e decoração para transformar seu Natal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://mundodonatal.com" },
      { rel: "preconnect", href: "https://cdn.shopify.com" },
      { rel: "preconnect", href: "https://cdn.utmify.com.br" },
      { rel: "preconnect", href: "https://connect.facebook.net" },
      { rel: "preconnect", href: "https://mundodonatal.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1207280195597113&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  // Guarda a origem da campanha (primeiro acesso) para enviar junto com o Pix.
  useEffect(() => {
    captureUtms(window.location.search);
  }, [location.href]);

  // Script oficial da UTMify para leitura e persistência dos parâmetros de campanha.
  useEffect(() => {
    if (document.querySelector('script[data-utmify-prevent-xcod-sck]')) return;

    const utmifyScript = document.createElement("script");
    utmifyScript.src = "https://cdn.utmify.com.br/scripts/utms/latest.js";
    utmifyScript.async = true;
    utmifyScript.defer = true;
    utmifyScript.setAttribute("data-utmify-prevent-xcod-sck", "");
    utmifyScript.setAttribute("data-utmify-prevent-subids", "");
    (document.head || document.documentElement).appendChild(utmifyScript);
  }, []);

  useEffect(() => {
    type MetaPixelFunction = ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      push?: (...args: unknown[]) => void;
      loaded?: boolean;
      version?: string;
    };
    const pixelWindow = window as typeof window & {
      fbq?: MetaPixelFunction;
      _fbq?: MetaPixelFunction;
      __mundoMetaPixelInitialized?: boolean;
    };

    if (!pixelWindow.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue?.push(args);
      } as MetaPixelFunction;
      fbq.queue = [];
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      pixelWindow.fbq = fbq;
      pixelWindow._fbq = fbq;
    }

    if (!pixelWindow.__mundoMetaPixelInitialized) {
      pixelWindow.fbq("init", "1207280195597113");
      pixelWindow.__mundoMetaPixelInitialized = true;
    }

    if (!document.getElementById("meta-pixel-script")) {
      const script = document.createElement("script");
      script.id = "meta-pixel-script";
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      (document.head || document.documentElement).appendChild(script);
    }

    pixelWindow.fbq("track", "PageView");
  }, [location.pathname, location.searchStr]);

  useEffect(() => {
    const utmifyWindow = window as typeof window & { pixelId?: string };
    utmifyWindow.pixelId = "6af63b44e978312a61bf3fe1";

    if (!document.getElementById("utmify-pixel-script")) {
      const utmifyScript = document.createElement("script");
      utmifyScript.id = "utmify-pixel-script";
      utmifyScript.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";
      utmifyScript.async = true;
      (document.head || document.documentElement).appendChild(utmifyScript);
    }
  }, []);



  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Header />
        <Outlet />
        <Footer />
        <CartDrawer />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
