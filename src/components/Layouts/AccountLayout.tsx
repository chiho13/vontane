import Link from "next/link";
import styled, { keyframes, useTheme } from "styled-components";
import Dropdown, { DropdownProvider } from "../Dropdown";
import Head from "next/head";

import { useRef, useState, useEffect, useMemo, createContext } from "react";
import { AccountLayoutStyle } from "./style";
import ChevronDown from "@/icons/ChevronDown";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import { workspace } from "@prisma/client";
import { useLocalStorage } from "usehooks-ts";

import { mq, breakpoints } from "@/utils/breakpoints";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ChevronsRight,
  ChevronsLeft,
  Menu,
  ChevronsUpDown,
  ArrowUpCircle,
  Settings,
} from "lucide-react";

import { LogoutIcon } from "@/icons/Logout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { Sidebar } from "../Sidebar";
import { useUserContext } from "@/contexts/UserContext";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { api } from "@/utils/api";

const SidebarContainer = styled.div`
  position: relative;
`;

const ToggleButtonWrapper = styled.div`
  position: fixed;
  top: 0;
  padding-top: 15px;
  left: 0;
  z-index: 100;
  display: block;
  height: 45px;
  width: 45px;
  display: flex;
  justify-content: center;

  ${mq.lg`
    height: 100%;
  `}
`;

const ToggleButton = styled.a`
  background-color: transparent;
  border-radius: 0.25rem;
  transition: background-color 300ms ease;
  height: 24px;
`;

const SidebarContent = styled.div<{ isLocked: boolean; isOpen: boolean }>`
position: fixed;
top: 0;
height: 100%;
width: 240px;
transform: ${(props) =>
  props.isLocked && props.isOpen ? "translateX(0)" : "translateX(-240px)"};
padding: 0;
z-index: 10;
 
border-left: none;
border-top-right-radius:  ${(props) =>
  !props.isLocked && props.isOpen && "4px"};
border-bottom-right-radius:  ${(props) =>
  !props.isLocked && props.isOpen && "4px"};
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06)};
transition: transform 300ms, ${(props) =>
  props.isLocked && props.isOpen
    ? "top 100ms, height 400ms"
    : "top 500ms, height 1000ms"};

  header {
    transition: ${(props) =>
      props.isLocked && props.isOpen ? "margin-top 100ms" : "margin-top 500ms"};
    margin-top: ${(props) => (props.isLocked && props.isOpen ? "0" : "0")};
  }

  ${mq.lg`
  top: ${(props) => (props.isLocked && props.isOpen ? "0" : "70px")};
  transform: ${(props) =>
    props.isLocked || props.isOpen ? "translateX(0)" : "translate(-270px)"};
    height: ${(props) => (props.isLocked && props.isOpen ? "100%" : "80%")};

    
    .dropdown-menu.dropdown-menu {
      top: 50px !important;
    }
  `}
`;

// left: ${(props) => (!props.isLocked && props.isOpen ? "250px" : "0")};

const SidebarItem = styled.li<{ activeWorkspace?: boolean }>`
  display: flex;
  padding: 4px;
  width: 100%;
  box-sizing: border-box;
  button {
    display: flex;
    padding: 8px 24px;
    width: 100%;
    border-radius: 4px;
    margin-top: 5px;
    transition: background-color 300ms ease, transform 300ms;
    overflow: hidden;

    &:active {
      transform: scale(0.97);
    }

    &:focus {
      outline: none;
    }

    span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 1;
  }
`;

const AnimatedIcon = styled.div<{ show: boolean }>`
  animation: ${({ show }) => (show ? fadeIn : fadeOut)} 0.3s linear;
`;

interface LayoutProps {
  children: React.ReactNode;
  profile: any;
  currentWorkspaceId?: string | string[];
}

export const LayoutContext = createContext({
  isLocked: true,
});

const Layout: React.FC<LayoutProps> = ({
  children,
  profile,
  currentWorkspaceId,
}) => {
  const router = useRouter();

  const { updatedWorkspace } = useWorkspaceTitleUpdate();
  const [isLocked, setIsLocked] = useLocalStorage("isLocked", true);
  const [isOpen, setIsOpen] = useLocalStorage("isOpen", true);

  const desktopbreakpoint = window.screen.width > breakpoints.lg;

  const [showChevronRight, setShowChevronRight] = useState(false);

  const accountDropdownRef = useRef<any>({});
  const supabase = useSupabaseClient();

  const theme = useTheme();

  async function logout() {
    await supabase.auth.signOut();
  }

  const [workspaces, setWorkspaces] = useState<workspace[]>([]);

  const { data: workspacesData, refetch: refetchWorkspaces } =
    api.workspace.getWorkspaces.useQuery();

  useEffect(() => {
    if (workspacesData) {
      const response = workspacesData.workspaces;

      setWorkspaces(response);
    }
  }, [workspacesData]);

  const createWorkspaceMutation = api.workspace.createWorkspace.useMutation();
  const handleWorkspaceRoute = (workspaceId: string, workspaceName: string) => {
    router.push(`/${workspaceId}`);
    refetchWorkspaces();
  };

  const upgradeAccount = () => {
    router.push(`/account/upgrade`);
  };

  const createWorkspace = async () => {
    try {
      const response = await createWorkspaceMutation.mutateAsync();
      if (response && response.workspace) {
        refetchWorkspaces();
        handleWorkspaceRoute(response.workspace.id, "");
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("isLocked", JSON.stringify(isLocked));
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem("isOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  const AvatarProfile = useMemo(() => {
    return (
      profile && (
        <img
          src={profile.avatar || ""}
          alt={`${profile.name}'s avatar`}
          className="mr-2 ml-2 h-9 w-9 rounded-full border border-gray-400"
        />
      )
    );
  }, [profile]);

  const toggleSidebarLock = (): void => {
    setIsLocked(!isLocked);

    if (!desktopbreakpoint) {
      setIsLocked(!isLocked);
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = (): void => {
    if (!isLocked && desktopbreakpoint) {
      setIsOpen(true);
      setShowChevronRight(true);
    }
  };

  const handleMouseLeave = (): void => {
    if (!isLocked && desktopbreakpoint) {
      setIsOpen(false);
      setShowChevronRight(false);
    }
  };

  useEffect(() => {
    if (!isLocked || !isOpen) {
      if (accountDropdownRef.current) {
        accountDropdownRef.current.handleClose();
      }
    }
  }, [isLocked, isOpen]);

  const ChevronRightToMenu = () => {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <AnimatedIcon show={showChevronRight}>
              {showChevronRight && desktopbreakpoint ? (
                <ChevronsRight />
              ) : (
                <Menu />
              )}
            </AnimatedIcon>
          </TooltipTrigger>
          <TooltipContent className="border-black" side="left">
            <p className="text-[12px] text-white">Lock Sidebar Open</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const TooltipChevronLeft = () => {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <ChevronsLeft />
          </TooltipTrigger>
          <TooltipContent className="border-black">
            <p className="text-[12px] text-white">Close Sidebar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <LayoutContext.Provider value={{ isLocked }}>
        <Head>
          <title>Verby </title>
          <meta name="description" content="Generated by create-t3-app" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
          />

          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SidebarContainer onMouseLeave={handleMouseLeave}>
          <ToggleButtonWrapper
            style={{
              transform: isLocked ? "translateX(190px)" : "translateX(0)",
              transition: isLocked ? "transform 300ms" : "transform 100ms",
            }}
            onMouseEnter={handleMouseEnter}
          >
            <ToggleButton
              className="text-darkergray hover:bg-gray-200"
              role="button"
              href="#"
              onClick={toggleSidebarLock}
            >
              {isLocked ? <TooltipChevronLeft /> : <ChevronRightToMenu />}
            </ToggleButton>
          </ToggleButtonWrapper>

          <SidebarContent
            isLocked={isLocked}
            isOpen={isOpen}
            className="bg-[#f4f4f4] dark:bg-accent"
          >
            <AccountLayoutStyle>
              <div className="z-10 flex items-center p-1">
                <DropdownProvider>
                  <Dropdown
                    dropdownId="sideBarDropdown"
                    ref={accountDropdownRef}
                    selectedItemText={profile && profile.name}
                    image={AvatarProfile}
                    dropdownButtonClassName="p-0 relative border-transparent relative outline-none border-0 shadow-none bg-transparent w-full h-[47px] justify-start transition-colors duration-300 focus:ring-2 focus:ring-black focus:ring-opacity-30 hover:bg-gray-200"
                    icon={<ChevronsUpDown className="w-4 text-darkgray" />}
                  >
                    <div className="p-1" role="none">
                      <Link
                        className="flex w-full items-center rounded-md px-4  py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        tabIndex={-1}
                        id="menu-item-3"
                        href="/account"
                      >
                        <Settings /> <span className="ml-2">Settings</span>
                      </Link>
                    </div>
                    <hr className="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
                    <div className="p-1" role="none">
                      <button
                        onClick={logout}
                        className="inline-flex w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        tabIndex={-1}
                        id="menu-item-3"
                      >
                        <LogoutIcon /> Log out
                      </button>
                    </div>
                  </Dropdown>
                </DropdownProvider>
              </div>
              <ul className="mt-10 mb-10">
                {workspaces &&
                  workspaces.map((workspace) => {
                    const parsedSlateValue = JSON.parse(workspace.slate_value);

                    const workspaceName = parsedSlateValue[0].children[0].text;
                    const displayName =
                      updatedWorkspace && updatedWorkspace.id === workspace.id
                        ? updatedWorkspace.title
                        : workspaceName;

                    return (
                      <SidebarItem key={workspace.id}>
                        <button
                          onClick={() => handleWorkspaceRoute(workspace.id, "")}
                          className={` hover:bg-gray-300 dark:hover:bg-muted ${
                            currentWorkspaceId === workspace.id
                              ? "bg-gray-300 font-bold dark:bg-muted"
                              : "transparent"
                          }`}
                        >
                          <span
                            className={`text-sm text-darkergray  dark:text-foreground`}
                          >
                            {displayName || "Untitled"}
                          </span>
                        </button>
                      </SidebarItem>
                    );
                  })}

                <SidebarItem>
                  <button
                    className="flex items-center hover:bg-gray-200 dark:hover:bg-muted"
                    onClick={createWorkspace}
                  >
                    <Plus className="text-darkergray  dark:text-foreground " />{" "}
                    <span className="ml-4 text-sm text-darkergray  dark:text-foreground">
                      Create Workspace
                    </span>
                  </button>
                </SidebarItem>
                {!profile?.is_subscribed && (
                  <SidebarItem
                    className={`${
                      isLocked ? "fixed bottom-10 " : "relative"
                    } left-0`}
                  >
                    <button
                      className={`flex items-center hover:bg-gray-200 dark:hover:bg-muted`}
                      onClick={upgradeAccount}
                    >
                      <ArrowUpCircle className="text-darkergray dark:text-foreground " />{" "}
                      <span className="ml-4 text-sm text-darkergray  dark:text-foreground ">
                        Upgrade Account
                      </span>
                    </button>
                  </SidebarItem>
                )}
              </ul>
            </AccountLayoutStyle>
          </SidebarContent>
        </SidebarContainer>
        <main
          className=" flex min-h-screen overflow-auto bg-[#f7f7f7] pt-4 dark:bg-muted"
          style={{
            marginLeft: isLocked && desktopbreakpoint ? "240px" : "0",
            width:
              isLocked && desktopbreakpoint ? "calc(100vw - 240px)" : "100vw",
            transition:
              "margin-left 300ms ease-in-out, width 300ms ease-in-out",
          }}
          data-locked={isLocked}
        >
          {children}
        </main>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;
