import React, { useState } from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: white;
  color: black;
  padding: 0.5rem;
  border-radius: 0.25rem;
`;

const SidebarContent = styled.div<{ isLocked: boolean; isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 12rem;
  height: 100%;
  background-color: #edf2f7;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: ${(props) =>
    props.isLocked || props.isOpen ? "translateX(0)" : "translateX(-100%)"};
  transition: transform 300ms;
`;

const SidebarItem = styled.li`
  padding: 0.5rem 0;
`;

export const Sidebar: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleSidebarLock = (): void => {
    setIsLocked(!isLocked);
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (): void => {
    if (!isLocked) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = (): void => {
    if (!isLocked) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToggleButton onClick={toggleSidebarLock}>
        {isLocked ? "Unlock" : "Lock"} Sidebar
      </ToggleButton>
      <SidebarContent isLocked={isLocked} isOpen={isOpen}>
        <ul>
          <SidebarItem>Item 1</SidebarItem>
          <SidebarItem>Item 2</SidebarItem>
          <SidebarItem>Item 3</SidebarItem>
        </ul>
      </SidebarContent>
    </SidebarContainer>
  );
};
