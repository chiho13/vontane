import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "styled-components";
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
    minWidth: "350px",
    flexBasis: `${rightSideBarWidth}px`,
    opacity: showRightSidebar ? "1" : "0",
    pointerEvents: showRightSidebar ? "auto" : "none",
    transition:
      "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
  };

  return (
    <div
      className="m-w-full mt-3 hidden grow rounded-md border border-gray-300 bg-white xl:block"
      style={rightSidebarStyle}
    >
      <div className="p-4">
        {/* <h2 className="mb-4 text-xl font-semibold">Right Sidebar</h2>
        <p>Hi kirby</p> */}
        <Tabs defaultValue="account">
          <TabsList
            className={`ring-gray ring-red grid h-10 w-full grid-cols-3  bg-lightgray`}
          >
            <TabsTrigger
              value="account"
              className={`data-[state=active]:bg-brand data-[state=active]:text-white `}
            >
              Text to Audio
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className={`data-[state=active]:bg-brand data-[state=active]:text-white `}
            >
              AI Assist
            </TabsTrigger>
            <TabsTrigger
              value="slide"
              className={`data-[state=active]:bg-brand data-[state=active]:text-white `}
              disabled={true}
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">tts</TabsContent>
          <TabsContent value="password">password</TabsContent>
          <TabsContent value="slide">password</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
