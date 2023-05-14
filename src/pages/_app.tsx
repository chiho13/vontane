import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "@/contexts/UserContext";
import { useState } from "react";
import { WorkspaceTitleUpdateProvider } from "@/contexts/WorkspaceTitleContext";
import "@/styles/globals.css";
import { TextSpeechProvider } from "@/contexts/TextSpeechContext";
import "@stripe/stripe-js";
import { ThemeProvider } from "@/components/theme-provider";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <UserContextProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WorkspaceTitleUpdateProvider>
            <TextSpeechProvider>
              <Component {...pageProps} />
            </TextSpeechProvider>
          </WorkspaceTitleUpdateProvider>
        </ThemeProvider>
      </UserContextProvider>
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);
