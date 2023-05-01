"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
export function Header() {
  const [top, setTop] = useState<boolean>(true);

  const router = useRouter();
  // detect whether user has scrolled the page down by 10px
  //   const scrollHandler = () => {
  //     window.pageYOffset > 10 ? setTop(false) : setTop(true);
  //   };

  //   useEffect(() => {
  //     scrollHandler();
  //     window.addEventListener("scroll", scrollHandler);
  //     return () => window.removeEventListener("scroll", scrollHandler);
  //   }, [top]);

  const goBack = () => {
    router.push("/");
  };
  return (
    <header
      className={`fixed z-30 w-full transition duration-300 ease-in-out md:bg-opacity-90`}
    >
      <div className="mx-auto max-w-6xl ">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Site branding */}
          <div className="mr-4 flex items-center">
            <div className="z-10 flex h-20 items-center">
              <button
                className="flex rounded-md bg-gray-200 px-4 py-2 transition duration-200 hover:bg-gray-300"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
            </div>
            <Image
              src="/images/vontanelogo.png"
              width="200"
              height="100"
              alt={"logo"}
            />
          </div>

          {/* <MobileMenu /> */}
        </div>
      </div>
    </header>
  );
}
