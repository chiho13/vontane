import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { type NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";

const Login: NextPage = () => {
  const supabase = useSupabaseClient();

  const router = useRouter();
  const { next } = router.query;
  const session = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session) {
      // After successful login
      router.replace(next ? decodeURIComponent(next as string) : "/");
    }
  }, [session]);

  async function loginWithGoogle() {
    if (next) {
      sessionStorage.setItem("next", decodeURIComponent(next as string));
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <>
      <Head>
        <title>Vontane | Login </title>
        <meta name="description" content="Vontane Login" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen  justify-center bg-gradient-to-b from-[#f1f1f1] to-[#e9e9e9]">
        <div className="ml-10 mr-10 mt-16 h-[300px] w-full rounded   bg-white p-10  shadow sm:w-[400px] lg:mt-[200px] ">
          <p
            tabIndex={0}
            role="heading"
            aria-label="Login to your account"
            className="text-2xl font-extrabold leading-6 text-gray-800 "
          >
            Login to your account
          </p>
          <button
            aria-label="Continue with google"
            role="button"
            className="mt-10 flex w-full items-center rounded-lg border border-accent px-4 py-3.5 transition duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-1"
            onClick={loginWithGoogle}
          >
            <svg
              width={19}
              height={20}
              viewBox="0 0 19 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.9892 10.1871C18.9892 9.36767 18.9246 8.76973 18.7847 8.14966H9.68848V11.848H15.0277C14.9201 12.767 14.3388 14.1512 13.047 15.0812L13.0289 15.205L15.905 17.4969L16.1042 17.5173C17.9342 15.7789 18.9892 13.221 18.9892 10.1871Z"
                fill="#4285F4"
              />
              <path
                d="M9.68813 19.9314C12.3039 19.9314 14.4999 19.0455 16.1039 17.5174L13.0467 15.0813C12.2286 15.6682 11.1306 16.0779 9.68813 16.0779C7.12612 16.0779 4.95165 14.3395 4.17651 11.9366L4.06289 11.9465L1.07231 14.3273L1.0332 14.4391C2.62638 17.6946 5.89889 19.9314 9.68813 19.9314Z"
                fill="#34A853"
              />
              <path
                d="M4.17667 11.9366C3.97215 11.3165 3.85378 10.6521 3.85378 9.96562C3.85378 9.27905 3.97215 8.6147 4.16591 7.99463L4.1605 7.86257L1.13246 5.44363L1.03339 5.49211C0.37677 6.84302 0 8.36005 0 9.96562C0 11.5712 0.37677 13.0881 1.03339 14.4391L4.17667 11.9366Z"
                fill="#FBBC05"
              />
              <path
                d="M9.68807 3.85336C11.5073 3.85336 12.7344 4.66168 13.4342 5.33718L16.1684 2.59107C14.4892 0.985496 12.3039 0 9.68807 0C5.89885 0 2.62637 2.23672 1.0332 5.49214L4.16573 7.99466C4.95162 5.59183 7.12608 3.85336 9.68807 3.85336Z"
                fill="#EB4335"
              />
            </svg>
            <p className="ml-4 text-base font-medium text-gray-700">
              Continue with Google
            </p>
          </button>

          <p className="mt-4 text-xs text-gray-700">
            By continuing to proceed you agree with Vontane's{" "}
            <a
              className="text-brand underline"
              href="https://vontane.com/terms"
            >
              Terms & Conditions
            </a>{" "}
          </p>
        </div>
      </main>
    </>
  );
};

export default Login;
