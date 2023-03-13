import React from "react";

interface UseDropdownProps {
  initialOpen?: boolean;
}

function useDropdown({ initialOpen = false }: UseDropdownProps = {}) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return { ref, isOpen, handleOpen, handleClose };
}

export default useDropdown;
