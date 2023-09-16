import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";
import { Input } from "../ui/input";
import { api } from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { Transforms } from "slate";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { debounce } from "lodash";
import { ReactEditor } from "slate-react";

export const ImageSettings = ({ element }) => {
  const { editor, activePath } = useContext(EditorContext);

  const [altText, setAltText] = useState(element.altText ?? null);
  const path = ReactEditor.findPath(editor, element);
  useEffect(() => {
    if (element.altText) {
      setAltText(element.altText);
    }
  }, [element.address]);

  const editAltText = (e) => {
    setAltText(e.target.value);
    Transforms.setNodes(editor, { altText: e.target.value }, { at: path });
  };

  if (element.type !== "image") {
    return <div></div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-bold mb-3 text-sm">Image Properties</h2>

      <h3 className="text-bold mb-1 mt-4 text-sm text-gray-500 dark:text-gray-400">
        Alt Text
      </h3>
      <div className="relative flex items-center">
        <input
          value={altText}
          className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-muted  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
          onChange={editAltText}
        />
      </div>
    </div>
  );
};
