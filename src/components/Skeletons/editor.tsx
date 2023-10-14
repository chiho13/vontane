import { Sidebar } from "lucide-react";
import { useEffect, useState } from "react";
import {
  VscLayoutSidebarRight,
  VscLayoutSidebarRightOff,
} from "react-icons/vsc";
import { Portal } from "react-portal";
import { useLocalStorage } from "usehooks-ts";
import { breakpoints } from "@/utils/breakpoints";

import React from "react";
export const EditorSkeleton = () => {
  const [showRightSidebar, setShowRightSidebar] = useState(
    JSON.parse(localStorage.getItem("showRightSidebar") || "true")
  );

  const rightSideBarWidth = 0;

  useEffect(() => {
    const sidebar = JSON.parse(
      localStorage.getItem("showRightSidebar") || "true"
    );

    setShowRightSidebar(sidebar);
  }, []);
  return (
    <div className="max-[1400px] relative mx-auto mt-[50px] px-4" style={{}}>
      <Portal>
        <button className="group fixed right-[30px] top-[30px] z-0 hidden rounded  border-gray-300 p-1 transition duration-300 hover:border-brand dark:border-accent dark:hover:border-foreground dark:hover:bg-muted xl:block">
          {!showRightSidebar ? (
            <VscLayoutSidebarRightOff className="  h-[20px] w-[20px] text-darkergray transition duration-300 group-hover:text-brand dark:text-muted-foreground dark:group-hover:text-foreground" />
          ) : (
            <VscLayoutSidebarRight className="  h-[20px] w-[20px] text-darkergray transition duration-300 group-hover:text-brand dark:text-muted-foreground dark:group-hover:text-foreground" />
          )}
        </button>
      </Portal>

      <div className="flex justify-center">
        <div className="block">
          <div
            className="relative z-0  block w-[90vw] rounded-md  border border-gray-300 bg-white  px-2 dark:border-accent  dark:bg-muted/70 lg:max-w-[800px] lg:px-0 xl:w-[780px]"
            style={{
              height: "calc(100svh - 100px)",
              right: !showRightSidebar ? -rightSideBarWidth / 2 : 0,
              // width: "1190px",
              width:
                window.innerWidth > breakpoints.lg
                  ? showRightSidebar
                    ? "50vw"
                    : "100vw"
                  : "95vw",
              transition: "right 0.3s ease-in-out",
            }}
          >
            <div className="mt-2 p-4 ">
              <div className="   ml-[48px] h-[40px] w-[50%] animate-pulse rounded-lg bg-gray-200 dark:bg-muted-foreground/50"></div>
              <div className="  ml-[48px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
              <div className="  ml-[48px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
              <div className="  ml-[48px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
              <div className="  ml-[48px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>

              <div className="  ml-[48px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
              <div className="  ml-[48px] mt-2 h-[25px] w-[60%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
            </div>
          </div>
        </div>
        {showRightSidebar && (
          <>
            <div className="flex h-[680px] items-center">
              <div
                className={`hidden w-[22px] opacity-0  transition duration-300 hover:opacity-100 lg:block`}
              >
                <div className="mx-auto mt-4 block h-[200px] w-[8px]  cursor-col-resize rounded bg-[#b4b4b4] "></div>
              </div>
            </div>
            <div
              className=" hidden grow rounded-md border border-gray-300 bg-white dark:border-accent  dark:bg-muted/70  lg:block  lg:w-[400px]"
              style={{
                height: "calc(100svh - 100px)",
                minWidth: "340px",
                opacity: 1,
                transition:
                  "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
              }}
            >
              <div className="p-4">
                <div className="mt-2 p-4 ">
                  <div className="  left-5 top-5 h-[40px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-muted-foreground/50"></div>
                  <div className="  left-5 mt-6 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
                  <div className=" left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
                  <div className="  left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground/50"></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
