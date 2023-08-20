import { useRef, useState } from "react";

export const usePopover = () => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const popOverTriggerRef = useRef(null);

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

  return {
    position,
    isPopoverVisible,
    handleRightClick,
    onOpenChange,
    popOverTriggerRef,
  };
};
