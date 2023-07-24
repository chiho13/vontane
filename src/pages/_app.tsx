import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "@/contexts/UserContext";
import { useMemo, useState } from "react";
import { WorkspaceTitleUpdateProvider } from "@/contexts/WorkspaceTitleContext";
import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "@/server/api/root"; // replace with your actual path

import "@/styles/globals.css";
import "@stripe/stripe-js";
import { ThemeProvider } from "@/components/theme-provider";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  // create persistent WebSocket connection
  const wsClient = useMemo(() => {
    return createWSClient({
      url: `ws://localhost:3001`,
    });
  }, []);

  // configure TRPCClient to use WebSockets transport
  const client = useMemo(() => {
    return createTRPCProxyClient({
      links: [
        wsLink({
          client: wsClient,
        }),
      ],
    });
  }, [wsClient]);

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <UserContextProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WorkspaceTitleUpdateProvider>
            <Component {...pageProps} />
          </WorkspaceTitleUpdateProvider>
        </ThemeProvider>
      </UserContextProvider>
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);
