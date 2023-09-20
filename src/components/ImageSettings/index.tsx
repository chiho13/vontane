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
import { Transforms, Node } from "slate";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { debounce } from "lodash";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";
import { useTextSpeech } from "@/contexts/TextSpeechContext";

export const ImageSettings = ({ element }) => {
  const { editor, activePath } = useContext(EditorContext);

  const { audioPointData } = useTextSpeech();

  const [altText, setAltText] = useState(element.altText ?? null);

  const [hotspotLabel, setHotspotLabel] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const path = ReactEditor.findPath(editor, element);

  const audioPointId = element.activeId || "";

  useEffect(() => {
    if (element.altText) {
      setAltText(element.altText);
    }
  }, [element.altText]);

  useEffect(() => {
    // Find the audio point corresponding to the active ID
    const activeAudioPoint = element.audioPoint.find(
      (point) => point.id === audioPointData
    );

    // If an activeAudioPoint is found, log its URL
    if (activeAudioPoint && activeAudioPoint.url) {
      console.log(activeAudioPoint.url);
      setAudioURL(activeAudioPoint.url);
    }

    if (activeAudioPoint && activeAudioPoint.label) {
      console.log(activeAudioPoint.label);
      setHotspotLabel(activeAudioPoint.label);
    }

    // Cleanup: Reset audioURL when the component unmounts or dependencies change
    return () => {
      setAudioURL("");
      setHotspotLabel("");
    };
  }, [element, audioPointData]);

  const editAltText = (e) => {
    setAltText(e.target.value);
    Transforms.setNodes(editor, { altText: e.target.value }, { at: path });
  };

  const [updateSlate, setUpdateSlate] = useState(false);
  const onChangeHotspotLabel = (e) => {
    const label = e.target.value;
    setHotspotLabel(label);
    const imageNode = Node.get(editor, path) as any;
    const audioPointIndex = imageNode.audioPoint.findIndex(
      (point) => point.id === audioPointData
    );

    if (audioPointIndex !== -1) {
      const newAudioPoint = [...imageNode.audioPoint];
      newAudioPoint[audioPointIndex] = {
        ...newAudioPoint[audioPointIndex],
        label: e.target.value,
      };

      Transforms.setNodes(editor, { audioPoint: newAudioPoint }, { at: path });
    }
  };

  const onChangeAudioURL = (e) => {
    const newAudioURL = e.target.value;
    setAudioURL(newAudioURL);
    const imageNode = Node.get(editor, path) as any;
    const audioPointIndex = imageNode.audioPoint.findIndex(
      (point) => point.id === audioPointData
    );

    if (audioPointIndex !== -1) {
      const newAudioPoint = [...imageNode.audioPoint];
      newAudioPoint[audioPointIndex] = {
        ...newAudioPoint[audioPointIndex],
        url: e.target.value,
      };

      Transforms.setNodes(editor, { audioPoint: newAudioPoint }, { at: path });
    }
  };

  // useEffect(() => {
  //   console.log(audioPointData);
  // }, []);

  const addAudioButton = () => {
    // If audioPoint is not defined or null, default to an empty array
    const currentAudioPoints = element.audioPoint || [];

    const randomX = Math.floor(Math.random() * 100);
    const randomY = Math.floor(Math.random() * 100);

    // Create a new audio point
    const newAudioPoint = {
      id: genNodeId(),
      url: "",
      link: "",
      x: randomX,
      y: randomY,
    };

    // Combine current audio points with the new one
    const updatedAudioPoints = [...currentAudioPoints, newAudioPoint];

    // Update the node in the editor with the new audio points
    Transforms.setNodes(
      editor,
      { audioPoint: updatedAudioPoints },
      { at: path }
    );
  };

  return (
    <div className="">
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

        <h3 className="text-bold mb-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
          Insert Tag
        </h3>

        <Button
          className="h-[32px] w-[32px] border border-gray-300 bg-transparent p-0 text-foreground hover:bg-gray-200"
          onClick={addAudioButton}
        >
          <Plus />
        </Button>
      </div>
      {audioPointData && (
        <div className="bg-accent p-4">
          <h3 className="text-bold mb-3 text-sm text-gray-500 dark:text-gray-400">
            Tag Content
          </h3>
          <div className="text-gray-500">ID: {audioPointData}</div>

          <label className="block pb-2 pt-2 text-sm">Label</label>

          <input
            value={hotspotLabel}
            className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-white  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
            onChange={onChangeHotspotLabel}
          />
          <label className="block pb-2 pt-4 text-sm">Audio URL</label>

          <input
            value={audioURL}
            className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-white  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
            onChange={onChangeAudioURL}
          />
        </div>
      )}
    </div>
  );
};
