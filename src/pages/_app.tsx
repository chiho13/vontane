import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "@/contexts/UserContext";
import { useState } from "react";

import "@/styles/globals.css";
import { ThemeProvider } from "styled-components";
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
}

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      [key: string]: string;
    };
    background: {
      [key: string]: string;
    };
    // Add other custom theme properties here
  }
}

const theme: Theme = {
  colors: {
    brand: "#f5820d",
    white: "#ffffff",
    gray: "#eeeeee",
    darkgray: "#999999",
    darkergray: "#444444",
  },
  background: {
    white: "linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%)",
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
          <Component {...pageProps} />
        </ThemeProvider>
      </UserContextProvider>
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);
