import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "styled-components";
import { TextSpeech } from "../TextSpeech";
import { useLocalStorage } from "usehooks-ts";
interface RightSideBarProps {
  showRightSidebar: boolean;
  rightSideBarWidth: number;
}

export const RightSideBar: React.FC<RightSideBarProps> = ({
  showRightSidebar,
  rightSideBarWidth,
}) => {
  const theme = useTheme();
  const rightSidebarStyle = {
    transform: `translateX(${
      showRightSidebar ? "0px" : `${rightSideBarWidth}px`
    })`,
    height: "calc(100vh - 120px)",
    minWidth: "340px",
    maxWidth: "570px",
    flexBasis: `${rightSideBarWidth}px`,
    opacity: showRightSidebar ? "1" : "0",
    pointerEvents: showRightSidebar ? "auto" : "none",
    transition:
      "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
  };

  const [tab, setTab] = useLocalStorage("tab", "suggestions");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  return (
    <div
      className="m-w-full bg-w mt-3 hidden grow rounded-md border border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-muted dark:text-lightgray lg:block"
      style={rightSidebarStyle}
    >
      <div className="p-4">
        {/* <h2 className="mb-4 text-xl font-semibold">Right Sidebar</h2>
        <p>Hi kirby</p> */}
        <Tabs defaultValue={tab} onValueChange={handleTabChange}>
          <TabsList
            className={`ring-gray ring-red grid h-10 w-full grid-cols-2  bg-lightgray dark:bg-accent`}
          >
            <TabsTrigger
              value="suggestions"
              className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
            >
              AI Assist
            </TabsTrigger>

            <TabsTrigger
              value="preview"
              className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
              disabled={true}
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions">
            {/* <TextSpeech /> */}
            Suggested content
          </TabsContent>
          <TabsContent value="slide">Doc or Slide Preview</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
