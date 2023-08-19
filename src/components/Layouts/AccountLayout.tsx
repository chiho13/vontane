import Link from "next/link";
import styled, { keyframes, useTheme } from "styled-components";
import Dropdown, { DropdownProvider } from "../Dropdown";
import Head from "next/head";

import {
  useRef,
  useState,
  useEffect,
  useMemo,
  createContext,
  use,
} from "react";
import { AccountLayoutStyle } from "./style";
import ChevronDown from "@/icons/ChevronDown";
import { useRouter } from "next/router";
import {
  Plus,
  Trash,
  MoreHorizontal,
  Undo2,
  FolderPlus,
  Folder,
  ChevronDown as ChevronDownLucide,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { workspace } from "@prisma/client";
import { useLocalStorage } from "usehooks-ts";
import { ModeToggle } from "../mode-toggle";

import { mq, breakpoints } from "@/utils/breakpoints";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  ChevronsRight,
  ChevronsLeft,
  Menu,
  ChevronsUpDown,
  ArrowUpCircle,
  Settings,
} from "lucide-react";

import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";

import { LogoutIcon } from "@/icons/Logout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { Sidebar } from "../Sidebar";
import { useUserContext } from "@/contexts/UserContext";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { api } from "@/utils/api";
import { Button } from "../ui/button";
import { on } from "process";
import { Portal } from "react-portal";
import { CreateNewFolder } from "../CreateNewFolder";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

const SidebarContainer = styled.div`
  position: relative;
`;

const ToggleButtonWrapper = styled.div`
  position: fixed;
  top: 0;
  padding-top: 15px;
  left: 3px;
  z-index: 1000;
  display: block;
  height: 45px;
  width: 45px;
  display: flex;
  justify-content: center;

  ${mq.lg`
    height: 80px;
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
z-index: 100;
 
border-left: none;
border-right-width: 1px;
border-top-width: ${(props) => !props.isLocked && props.isOpen && "1px"};
border-bottom-width: ${(props) => !props.isLocked && props.isOpen && "1px"};

border-top-right-radius:  ${(props) =>
  !props.isLocked && props.isOpen && "4px"};
border-bottom-right-radius:  ${(props) =>
  !props.isLocked && props.isOpen && "4px"};
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06)};
transition: transform 300ms, ${(props) =>
  props.isLocked && props.isOpen
    ? "top 200ms, height 200ms"
    : "top 500ms, height 200ms"};

  header {
    transition: ${(props) =>
      props.isLocked && props.isOpen ? "margin-top 100ms" : "margin-top 500ms"};
    margin-top: ${(props) => (props.isLocked && props.isOpen ? "0" : "0")};
  }

  @media (min-width: 1024px) {
  top: ${(props) => (props.isLocked && props.isOpen ? "0" : "70px")};
  transform: ${(props) =>
    props.isLocked || props.isOpen ? "translateX(0)" : "translate(-270px)"};
    height: ${(props) => (props.isLocked && props.isOpen ? "100%" : "80%")};

    
    .dropdown-menu.dropdown-menu {
      top: 50px !important;
    }
  }
`;

// left: ${(props) => (!props.isLocked && props.isOpen ? "250px" : "0")};

const SidebarItem = styled.li<{ activeWorkspace?: boolean }>`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 4px;
  button {
    display: flex;
    padding: 8px 24px;
    width: 100%;
    border-radius: 4px;
    transition: background-color 300ms ease, transform 300ms;
    overflow: hidden;

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
  refetchWorkspaceData?: any;
  isTrashed?: Boolean;
}

export const LayoutContext = createContext({
  isLocked: true,
  workspaces: {},
});

const Layout: React.FC<LayoutProps> = ({
  children,
  profile,
  currentWorkspaceId,
  refetchWorkspaceData,
  isTrashed,
}) => {
  const router = useRouter();

  const { updatedWorkspace } = useWorkspaceTitleUpdate();
  const [isLocked, setIsLocked] = useLocalStorage("isLocked", false);
  const [isOpen, setIsOpen] = useLocalStorage("isOpen", false);

  const desktopbreakpoint = window.screen.width > breakpoints.lg;

  const [showChevronRight, setShowChevronRight] = useState(false);

  const accountDropdownRef = useRef<any>({});

  const binRef = useRef<any>({});
  const supabase = useSupabaseClient();

  const theme = useTheme();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const [workspaces, setWorkspaces] = useState<workspace[]>([]);
  const [trashWorkspace, setTrashWorkspace] = useState<workspace[]>([]);

  const [workspaceFolders, setWorkspacesFolders] = useState(null);

  const { data: workspacesData, refetch: refetchWorkspaces } =
    api.workspace.getWorkspaces.useQuery();

  const { data: folderWorkspaceData, refetch: refetchFolderWorkspaceData } =
    api.workspace.getFolderAndWorkspaces.useQuery();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (workspacesData) {
      const response = workspacesData.workspaces;

      const trash = workspacesData.trash;
      // setWorkspaces(response);
      setTrashWorkspace(trash);
    }
  }, [workspacesData]);

  useEffect(() => {
    if (folderWorkspaceData) {
      const response = folderWorkspaceData;

      setWorkspacesFolders(response.folders);
      setWorkspaces(response.rootLevelworkspaces);
      console.log(response);
    }
  }, [folderWorkspaceData]);

  const createWorkspaceMutation = api.workspace.createWorkspace.useMutation();
  const handleWorkspaceRoute = (workspaceId: string) => {
    router.push(`/docs/${workspaceId}`);
    refetchFolderWorkspaceData();
    refetchWorkspaceData();
  };

  const createWorkspace = async () => {
    try {
      const response = await createWorkspaceMutation.mutateAsync();
      if (response && response.workspace) {
        refetchFolderWorkspaceData();
        refetchWorkspaceData();
        handleWorkspaceRoute(response.workspace.id);
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
          className="ml-2 mr-2 h-9 w-9 rounded-full border border-gray-400"
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

  const handleMouseEnter = (e): void => {
    e.stopPropagation();
    if (!isLocked && desktopbreakpoint) {
      setIsOpen(true);
      setShowChevronRight(true);
    }
  };

  const handleMouseLeave = (e): void => {
    e.stopPropagation();
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

  const softDeleteMutation = api.workspace.softDeleteWorkspace.useMutation();

  const softDeleteWorkspace = async (id) => {
    try {
      const response = await softDeleteMutation.mutateAsync({
        id,
      });
      if (response) {
        refetchFolderWorkspaceData();
        refetchWorkspaceData();
        console.log(response);
      }
    } catch (error) {
      console.error("Error Deleting:", error);
    }
  };

  const restoreWorkspaceMutation = api.workspace.restoreWorkspace.useMutation();

  const restoreWorkspace = async () => {
    try {
      const response = await restoreWorkspaceMutation.mutateAsync({
        id: currentWorkspaceId as string,
      });
      if (response) {
        refetchWorkspaces();
        refetchWorkspaceData();
        console.log(response);
      }
    } catch (error) {
      console.error("Error Deleting:", error);
    }
  };

  const ChevronRightToMenu = () => {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <AnimatedIcon show={showChevronRight}>
              {showChevronRight && desktopbreakpoint ? (
                <ChevronsRight className=" text-gray-400 dark:group-hover:text-foreground" />
              ) : (
                <Menu className="text-gray-400 dark:text-muted-foreground" />
              )}
            </AnimatedIcon>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-[12px]">Lock Sidebar Open</p>
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
            <ChevronsLeft className="text-gray-400 dark:text-muted-foreground dark:group-hover:text-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-[12px]">Close Sidebar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const moveWorkspaceMutation = api.workspace.moveWorkspace.useMutation();

  const [draggedItem, setDraggedItem] = useState(null);

  const [openFolder, setOpenFolder] = useState("");
  const handleDragStart = (event) => {
    const { active } = event;
    const workspaceId = active.id;
    const workspace = workspaces.find((ws) => ws.id === workspaceId);
    setDraggedItem(workspace);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over) {
      const workspaceId = active.id;
      const folderId = over.id.replace("folder-", "");

      if (over.id.startsWith("folder-")) {
        console.log(
          `Workspace ${workspaceId} was dragged over folder ${folderId}`
        );

        try {
          const response = await moveWorkspaceMutation.mutateAsync({
            workspace_id: workspaceId,
            folder_id: folderId,
          });
          if (response) {
            refetchFolderWorkspaceData();
            refetchWorkspaceData();
          }
        } catch (error) {
          console.error("Error moving workspace:", error);
        }
      }
    }
  };

  const moveBackToTopLevel = async (workspaceId) => {
    try {
      const response = await moveWorkspaceMutation.mutateAsync({
        workspace_id: workspaceId,
        folder_id: "",
      });
      if (response) {
        refetchFolderWorkspaceData();
        refetchWorkspaceData();
      }
    } catch (error) {
      console.error("Error moving workspace:", error);
    }
  };

  return (
    <>
      <LayoutContext.Provider value={{ isLocked, workspaces }}>
        <Head>
          <title>Vontane</title>
          <meta name="description" content="Generated by create-t3-app" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
          />

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
        <SidebarContainer>
          <ToggleButtonWrapper
            style={{
              transform: isLocked ? "translateX(190px)" : "translateX(0)",
              transition: isOpen ? "transform 300ms" : "transform 100ms",
            }}
            onMouseEnter={handleMouseEnter}
          >
            <ToggleButton
              className="z-100 group text-darkergray  hover:bg-gray-200 hover:dark:bg-accent"
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
            className="bg-background dark:border-accent dark:bg-muted"
          >
            <AccountLayoutStyle>
              <div className="z-10 flex items-center p-1">
                <DropdownProvider>
                  <Dropdown
                    dropdownId="sideBarDropdown"
                    ref={accountDropdownRef}
                    selectedItemText={profile && profile.name}
                    image={AvatarProfile}
                    dropdownButtonClassName="p-0 relative border-transparent relative outline-none border-0 shadow-none bg-transparent w-full h-[47px] justify-start transition-colors duration-300 focus:ring-2 focus:ring-black focus:ring-opacity-30 hover:bg-gray-200 dark:hover:bg-accent"
                    icon={
                      <ChevronsUpDown className="w-4 text-darkgray dark:text-muted-foreground" />
                    }
                    dropdownMenuNonPortalOverride={
                      "lg:absolute left-5 dark:bg-background"
                    }
                  >
                    <div className="p-1" role="none">
                      <button
                        onClick={logout}
                        className="h-[40 px]  inline-flex w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-foreground dark:hover:bg-accent"
                        role="menuitem"
                        tabIndex={-1}
                        id="menu-item-3"
                      >
                        <LogoutIcon />{" "}
                        <span className="dark:text-foreground ">Log out</span>
                      </button>
                    </div>
                  </Dropdown>
                </DropdownProvider>
              </div>
              {/* <div className="mt-3 flex w-full justify-end p-1  ">
                <Button
                  className=" border-gray-accent flex items-center rounded-md border bg-white p-1 transition duration-200 hover:bg-neutral-100  dark:hover:bg-gray-300"
                  style={{
                    height: 32,
                    width: 32,
                  }}
                >
                  <FolderPlus
                    className="text-darkergray  dark:text-background"
                    width={22}
                  />{" "}
                </Button>
              </div> */}
              <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
              >
                <ul
                  className="mb-10 mt-4  overflow-y-auto"
                  style={{
                    height: `calc(100vh - ${!isLocked ? "370px" : "200px"})`,
                  }}
                >
                  {workspaceFolders &&
                    workspaceFolders.map((folder) => {
                      return (
                        <FolderWorkspaceItem
                          key={folder.id}
                          folder={folder}
                          handleWorkspaceRoute={handleWorkspaceRoute}
                          softDeleteWorkspace={softDeleteWorkspace}
                          moveBackToTopLevel={moveBackToTopLevel}
                        />
                      );
                    })}

                  {workspaces &&
                    workspaces.map((workspace) => (
                      <SidebarWorkspaceItem
                        key={workspace.id}
                        workspace={workspace}
                        handleWorkspaceRoute={handleWorkspaceRoute}
                        softDeleteWorkspace={softDeleteWorkspace}
                        moveBackToTopLevel={moveBackToTopLevel}
                      />
                    ))}

                  <SidebarItem onClick={createWorkspace} className="w-[100px]">
                    <button className=" flex h-[36px] items-center rounded-md px-2 transition duration-200 hover:bg-gray-200 dark:hover:bg-accent">
                      <Plus
                        className="text-darkergray  dark:text-foreground"
                        width={22}
                      />{" "}
                      <span className="ml-2 text-sm text-darkergray  dark:text-foreground">
                        New Document
                      </span>
                    </button>
                  </SidebarItem>
                  <DragOverlay>
                    {draggedItem && (
                      <div className="opacity-80">
                        <SidebarWorkspaceItem
                          workspace={draggedItem}
                          handleWorkspaceRoute={() => {}}
                          softDeleteWorkspace={() => {}}
                          moveBackToTopLevel={() => {}}
                        />
                      </div>
                    )}
                  </DragOverlay>
                </ul>
              </DndContext>

              <ul className="absolute bottom-5 w-full">
                <SidebarItem
                // onClick={createWorkspace}
                >
                  <CreateNewFolder />
                  {/* <button className=" flex h-[36px] items-center rounded-md px-2 transition duration-200 hover:bg-gray-200 dark:hover:bg-accent">
                    <FolderPlus
                      className="text-darkergray  dark:text-foreground"
                      width={22}
                    />{" "}
                    <span className="ml-2 text-sm text-darkergray  dark:text-foreground">
                      New Folder
                    </span>
                  </button> */}
                </SidebarItem>
                <SidebarItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-[36px] items-center  hover:bg-gray-200 dark:hover:bg-accent">
                        <Trash
                          className="text-darkergray  dark:text-foreground"
                          width={18}
                        />{" "}
                        <span className="ml-4 text-sm text-darkergray  dark:text-foreground">
                          Bin
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      sideOffset={5}
                      side="right"
                      className={`z-1000 relative  -left-[10px] ${
                        isLocked && isOpen ? "bottom-[25px]" : "bottom-[65px]"
                      }  h-[200px] w-[300px] overflow-y-auto rounded-l-none border-l-0 bg-background p-4 shadow-md dark:border-accent dark:bg-muted`}
                    >
                      {trashWorkspace.length === 0 && "empty"}
                      {trashWorkspace &&
                        trashWorkspace.map((workspace) => {
                          const parsedSlateValue = JSON.parse(
                            workspace.slate_value as any
                          );

                          const workspaceName =
                            parsedSlateValue[0].children[0].text;
                          const displayName =
                            updatedWorkspace &&
                            updatedWorkspace.id === workspace.id
                              ? updatedWorkspace.title
                              : workspaceName;

                          return (
                            <DropdownMenuItem
                              key={workspace.id}
                              className="group relative flex cursor-pointer rounded-md"
                              onClick={() => handleWorkspaceRoute(workspace.id)}
                            >
                              <div className="flex w-full items-center justify-between">
                                <span
                                  className={`grow text-sm  text-darkergray dark:text-foreground`}
                                >
                                  {displayName || "Untitled"}
                                </span>
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <a
                                        href="#"
                                        role="button"
                                        className="flex h-[22px] w-[22px] items-center justify-center rounded-md p-0 opacity-0 outline-none transition  duration-300 hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-600"
                                        onClick={restoreWorkspace}
                                      >
                                        <Undo2
                                          className="text-darkergray  dark:stroke-foreground"
                                          width={18}
                                        />{" "}
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="text-[12px]">Restore</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarItem>
              </ul>
            </AccountLayoutStyle>
          </SidebarContent>
        </SidebarContainer>

        <div
          className="fixed left-0 top-0 h-full w-[45px]"
          onMouseEnter={handleMouseEnter}
        ></div>
        <main
          className=" flex min-h-screen overflow-auto bg-[#f7f7f7] pt-4 dark:bg-background"
          style={{
            marginLeft: isLocked && desktopbreakpoint ? "240px" : "0",
            width:
              isLocked && desktopbreakpoint ? "calc(100vw - 240px)" : "100vw",
            transition:
              "margin-left 300ms ease-in-out, width 300ms ease-in-out",
          }}
          data-locked={isLocked}
          onMouseEnter={handleMouseLeave}
        >
          {isTrashed && (
            <div className="fixed left-0 right-0 top-0 flex justify-center ">
              <div className="item-center flex w-[300px] justify-center gap-4 bg-[#EB5756] p-2 text-sm  text-white">
                <p className="flex items-center">
                  This workspace is in the bin
                </p>
                <Button
                  size="xs"
                  className="border border-white  bg-transparent p-1 px-2 text-sm text-white hover:bg-white/10"
                  onClick={restoreWorkspace}
                >
                  Restore
                </Button>
              </div>
            </div>
          )}
          {children}

          <div className="fixed bottom-4 right-4">
            <ModeToggle side="top" />
          </div>
        </main>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;

const SidebarWorkspaceItem = ({
  workspace,
  handleWorkspaceRoute,
  softDeleteWorkspace,
  moveBackToTopLevel,
  classNames = "",
}) => {
  const router = useRouter();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: workspace.id,
  });

  const currentWorkspaceId = router.query.workspaceId as string;
  const popOverTriggerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPopoverVisible, setPopoverVisible] = useState(false);

  const handleRightClick = (e) => {
    e.preventDefault();
    if (popOverTriggerRef.current) {
      const rect = popOverTriggerRef.current.getBoundingClientRect();
      setPosition({
        top: e.clientY - rect.top - 20,
        left: e.clientX - rect.left,
      });
    }
    setPopoverVisible(true);
  };

  const onOpenChange = (value) => {
    setPosition({
      top: 0,
      left: 0,
    });
    setPopoverVisible(value);
  };

  const parsedSlateValue = JSON.parse(workspace.slate_value as any);
  const workspaceName = parsedSlateValue[0].children[0].text;
  const displayName =
    workspaceName.trimStart() !== "" ? workspaceName : "Untitled";

  return (
    <>
      {isPopoverVisible && (
        <Portal>
          <div
            className="closeOutside   fixed left-0 top-0 h-full w-screen"
            style={{ zIndex: 1000 }}
          ></div>
        </Portal>
      )}
      <SidebarItem
        key={workspace.id}
        onClick={(e) => {
          e.stopPropagation();
          handleWorkspaceRoute(workspace.id);
        }}
        onContextMenu={handleRightClick}
        className={cn(
          `relative  ring-brand transition duration-300 focus:ring-2 dark:ring-white 
        ${
          currentWorkspaceId === workspace.id
            ? "bg-gray-200 font-bold dark:bg-accent"
            : "transparent"
        }
        hover:bg-gray-200 dark:hover:bg-accent 
        `,
          classNames
        )}
      >
        <button
          className={` group relative flex  items-center  
          `}
          ref={setNodeRef}
          {...listeners}
          {...attributes}
        >
          <span className={`text-sm text-darkergray  dark:text-foreground`}>
            {displayName}
          </span>

          <Popover open={isPopoverVisible} onOpenChange={onOpenChange}>
            <PopoverTrigger
              ref={popOverTriggerRef}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="  absolute right-2 flex h-[22px] w-[22px] items-center justify-center rounded-md p-0 opacity-0 outline-none transition  duration-300 hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-600"
              style={{ width: "22px", padding: 0 }}
            >
              <MoreHorizontal
                className="text-darkergray  dark:stroke-foreground"
                width={18}
              />
            </PopoverTrigger>
            <PopoverContent
              className="w-[250px] p-1 dark:border-gray-800 dark:bg-accent"
              align="start"
              style={{
                position: "fixed",
                zIndex: 1000,
                left: position.left,
                top: position.top,
              }}
            >
              {workspace.folder_id && (
                <button
                  className={`flex w-full cursor-pointer items-center gap-4  rounded-md  px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-accent hover:text-gray-900 focus:outline-none dark:text-foreground dark:hover:bg-neutral-800 `}
                  onClick={() => moveBackToTopLevel(workspace.id)}
                >
                  <ArrowRight className="w-4 text-gray-700 dark:text-gray-200 " />{" "}
                  Move to Top Level
                </button>
              )}
              <button
                className={`flex w-full cursor-pointer items-center gap-4  rounded-md  px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-accent hover:text-gray-900 focus:outline-none dark:text-foreground dark:hover:bg-neutral-800 `}
                onClick={() => softDeleteWorkspace(workspace.id)}
              >
                <Trash className="w-4 text-gray-700 dark:text-gray-200 " /> Move
                to Bin
              </button>
            </PopoverContent>
          </Popover>
        </button>
      </SidebarItem>
    </>
  );
};

const FolderWorkspaceItem = ({
  folder,
  handleWorkspaceRoute,
  softDeleteWorkspace,
  moveBackToTopLevel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMovingOver, setIsOver] = useState(false);

  const variants = {
    open: { opacity: 1, maxHeight: 1000 }, // You might want to set this to an appropriate value
    closed: { opacity: 0, maxHeight: 0 },
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { folderId: folder.id },
  });

  useEffect(() => {
    setIsOver(isOver);
  }, [isOver]);
  return (
    <div className={`${isExpanded ? "bg-accent" : ""} mb-4`}>
      <li ref={setNodeRef} className="relative w-full">
        <button
          className={`relative flex h-[36px] w-full items-center px-2  pl-[24px] transition duration-200 hover:bg-gray-200 dark:hover:bg-accent ${
            isMovingOver ? "bg-brand/20" : ""
          }`}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ChevronDownLucide className="absolute left-1 w-5 text-darkergray  dark:text-foreground" />
          ) : (
            <ChevronRight className="absolute left-1 w-5 text-darkergray  dark:text-foreground" />
          )}
          <Folder
            className="text-darkergray  dark:text-foreground"
            width={16}
          />
          <span className="ml-2 text-sm text-darkergray  dark:text-foreground">
            {folder.name}
          </span>
        </button>
      </li>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {folder.workspaces.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-300">
                empty
              </div>
            ) : (
              <ul>
                {folder.workspaces.map((workspace) => (
                  <SidebarWorkspaceItem
                    key={workspace.id}
                    workspace={workspace}
                    handleWorkspaceRoute={handleWorkspaceRoute}
                    softDeleteWorkspace={softDeleteWorkspace}
                    moveBackToTopLevel={moveBackToTopLevel}
                    classNames="pl-[24px] "
                  />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
