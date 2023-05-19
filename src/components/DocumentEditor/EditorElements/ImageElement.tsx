import { useContext, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { BlockMath } from "react-katex";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Editor } from "slate";
import { OptionMenu } from "../OptionMenu";
import { Image as ImageIcon } from "lucide-react";

export function ImageElement(props) {
  const { attributes, children, element } = props;
  const { editor, showEditBlockPopup, selectedElementID } =
    useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  // console.log(elementID, element.id);
  // console.log(selectedElementID, element.id, showEditBlockPopup);

  return (
    <div
      tabIndex={0}
      data-path={JSON.stringify(path)}
      data-id={element.id}
      className={`hover:bg-gray-muted relative  flex cursor-pointer items-center rounded-md p-2 transition dark:bg-background 
      dark:hover:bg-background/70`}
      contentEditable={false}
    >
      {element.url?.trim() === "" && (
        <div className="flex items-center">
          <ImageIcon
            width={46}
            height={46}
            className="rounded-md opacity-30 dark:bg-transparent"
          />
          <span className="ml-4 opacity-30">Add an Image</span>
        </div>
      )}

      {children}
    </div>
  );
}
