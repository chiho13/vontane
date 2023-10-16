import {
  useState,
  useRef,
  useCallback,
  useEffect,
  MutableRefObject,
} from "react";
import { Path, Transforms } from "slate";

export enum Position {
  Left = "left",
  Right = "right",
  Bottom = "bottom",
}
interface ResizeBlock {
  handleMouseDown: () => void;
  setPos: (pos: Position) => void;
  ref: MutableRefObject<null>;
  blockWidth: number;
  blockHeight: number;
}

export const useResizeBlock = (
  element: any,
  editor: any,
  path: Path
): ResizeBlock => {
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [blockWidth, setWidth] = useState<number>(element.width || 710);
  const [blockHeight, setHeight] = useState<number>(element.height || 400);
  const [pos, setPos] = useState<Position>(Position.Left);
  const ref = useRef<any>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    const newElement = { ...element, width: blockWidth, height: blockHeight };

    Transforms.setNodes(editor, newElement, { at: path });
  }, [blockWidth, blockHeight, element, editor, path]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        if (pos === Position.Bottom) {
          const newHeight =
            e.clientY - (ref.current?.getBoundingClientRect().top || 0);
          setHeight(Math.min(Math.max(newHeight, 150), 800));
        } else {
          const newWidth =
            pos === Position.Left
              ? (ref.current?.getBoundingClientRect().right || 0) - e.clientX
              : e.clientX - (ref.current?.getBoundingClientRect().left || 0);

          if (element.type === "datavis") {
            setWidth(Math.min(Math.max(newWidth, 220), 675));
          } else {
            setWidth(Math.min(Math.max(newWidth, 150), 675));
          }
        }
      }
    },
    [isResizing, pos, ref]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return { handleMouseDown, setPos, ref, blockWidth, blockHeight };
};
