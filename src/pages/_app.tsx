import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "@/contexts/UserContext";
import { useState } from "react";
import { WorkspaceTitleUpdateProvider } from "@/contexts/WorkspaceTitleContext";
import "@/styles/globals.css";
import { ThemeProvider } from "styled-components";
import { TextSpeechProvider } from "@/contexts/TextSpeechContext";
interface Theme {
  colors: {
    brand: string;
    white: string;
    gray: string;
    darkgray: string;
    darkergray: string;
  };
  background: {
    white: string;
  };
  audio: {
    frameColor: string;
  };
}

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      [key: string]: string;
    };
    background: {
      [key: string]: string;
    };
    audio?: {
      [key: string]: string;
    };
    // Add other custom theme properties here
  }
}

const theme: Theme = {
  colors: {
    brand: "#348EF3",
    white: "#ffffff",
    gray: "#eeeeee",
    darkgray: "#999999",
    darkergray: "#666666",
  },
  background: {
    white: "linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%)",
  },
  audio: {
    frameColor: "#348EF3",
  },
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <UserContextProvider>
        <ThemeProvider theme={theme}>
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
