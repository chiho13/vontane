import Link from "next/link";
import styled, { keyframes } from "styled-components";
import Dropdown from "../Dropdown";
import Head from "next/head";

import { useRef, useState, useEffect } from "react";
import { AccountLayoutStyle } from "./style";
import ChevronDown from "@/icons/ChevronDown";
import { ChevronsRight, ChevronsLeft, Menu } from "lucide-react";

import { LogoutIcon } from "@/icons/Logout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { Sidebar } from "../Sidebar";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.brand};
`;

const Navbar = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.brand};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SidebarContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: white;
  color: black;
  padding: 0.5rem;
  border-radius: 0.25rem;
`;

const SidebarContent = styled.div<{ isLocked: boolean; isOpen: boolean }>`
position: fixed;
top: ${(props) => (props.isLocked && props.isOpen ? "0" : "40px")};
transform: ${(props) =>
  props.isLocked || props.isOpen ? "translateX(0)" : "translateX(-270px)"};
width: 270px;
height: ${(props) =>
  props.isLocked && props.isOpen ? "100%" : "calc(100% - 40px)"};
background-color: #edf2f7;
padding: 1rem;
z-index: 10;

box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06)};
transition: transform 300ms, ${(props) =>
  props.isLocked && props.isOpen
    ? "top 100ms, height 100ms"
    : "top 1000ms, height 1000ms"};

  header {
    transition: ${(props) =>
      props.isLocked && props.isOpen
        ? "margin-top 100ms"
        : "margin-top 1000ms"};
    margin-top: ${(props) => (props.isLocked && props.isOpen ? "40px" : "0")};
  }
`;

// left: ${(props) => (!props.isLocked && props.isOpen ? "250px" : "0")};

const SidebarItem = styled.li`
  padding: 0.5rem 0;
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
}

const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const [isLocked, setIsLocked] = useState<boolean>(
    JSON.parse(localStorage.getItem("isLocked") || "true")
  );
  const [isOpen, setIsOpen] = useState<boolean>(
    JSON.parse(localStorage.getItem("isOpen") || "true")
  );

  const [showChevronRight, setShowChevronRight] = useState(false);

  const accountDropdownRef = useRef<any>({});
  const supabase = useSupabaseClient();

  console.log(profile);

  async function logout() {
    await supabase.auth.signOut();
  }

  useEffect(() => {
    localStorage.setItem("isLocked", JSON.stringify(isLocked));
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem("isOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  function AvatarProfile() {
    return (
      profile && (
        <img
          src={profile.avatar || ""}
          alt={`${profile.name}'s avatar`}
          className="w-12 rounded-full"
        />
      )
    );
  }

  const toggleSidebarLock = (): void => {
    setIsLocked(!isLocked);
  };

  const handleMouseEnter = (): void => {
    if (!isLocked) {
      setIsOpen(true);
      setShowChevronRight(true);
    }
  };

  const handleMouseLeave = (): void => {
    if (!isLocked) {
      setIsOpen(false);
      setShowChevronRight(false);
    }
  };

  const ChevronRightToMenu = () => {
    return (
      <AnimatedIcon show={showChevronRight}>
        {showChevronRight ? <ChevronsRight /> : <Menu />}
      </AnimatedIcon>
    );
  };

  return (
    <>
      <Head>
        <title>Verby </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SidebarContainer
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ToggleButton
          onClick={toggleSidebarLock}
          style={{
            transform: isLocked ? "translateX(230px)" : "translateX(0)",
            transition: isLocked ? "transform 200ms" : "transform 400ms",
          }}
        >
          {isLocked ? <ChevronsLeft /> : <ChevronRightToMenu />}
        </ToggleButton>

        <SidebarContent isLocked={isLocked} isOpen={isOpen}>
          <AccountLayoutStyle className="z-10 flex items-center p-4">
            <Dropdown
              id="voiceDropdown"
              ref={accountDropdownRef}
              image={<AvatarProfile />}
            >
              {/* <ul>
            <li>Logout</li>
          </ul> */}
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
            <span className="z-50 pl-4 font-bold">
              {profile && profile.name}
            </span>
          </AccountLayoutStyle>
          <ul>
            <SidebarItem>Item 1</SidebarItem>
            <SidebarItem>Item 2</SidebarItem>
            <SidebarItem>Item 3</SidebarItem>
          </ul>
        </SidebarContent>
      </SidebarContainer>
      <main
        className="min-h-screen bg-gradient-to-b from-[#f1f1f1] to-[#e9e9e9] pl-6 pt-4 "
        style={{
          transform: isLocked ? "translateX(150px)" : "translateX(0)",
          transition: "transform 300ms",
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
