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

  const { audioPointData, setAudioPointData } = useTextSpeech();

  const [altText, setAltText] = useState(element.altText ?? null);

  const [hotspotLabel, setHotspotLabel] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [link, setLink] = useState("");

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
    if (activeAudioPoint && activeAudioPoint.link) {
      console.log(activeAudioPoint.link);
      setLink(activeAudioPoint.link);
    }

    // Cleanup: Reset audioURL when the component unmounts or dependencies change
    return () => {
      setAudioURL("");
      setHotspotLabel("");
      setLink("");
    };
  }, [element, audioPointData]);

  const editAltText = (e) => {
    setAltText(e.target.value);
    Transforms.setNodes(editor, { altText: e.target.value }, { at: path });
  };

  const [updateSlate, setUpdateSlate] = useState(false);

  const updateAudioPoint = (property, value) => {
    const imageNode = Node.get(editor, path) as any;
    const audioPointIndex = imageNode.audioPoint.findIndex(
      (point) => point.id === audioPointData
    );

    if (audioPointIndex !== -1) {
      const newAudioPoint = [...imageNode.audioPoint];
      newAudioPoint[audioPointIndex] = {
        ...newAudioPoint[audioPointIndex],
        [property]: value,
      };

      Transforms.setNodes(editor, { audioPoint: newAudioPoint }, { at: path });
    }
  };

  const onChangeHotspotLabel = (e) => {
    const label = e.target.value;
    setHotspotLabel(label);
    updateAudioPoint("label", label);
  };

  const onChangeAudioURL = (e) => {
    const newAudioURL = e.target.value;
    setAudioURL(newAudioURL);
    updateAudioPoint("url", newAudioURL);
  };

  const onChangeLink = (e) => {
    const newLink = e.target.value;
    setLink(newLink);
    updateAudioPoint("link", newLink);
  };

  // useEffect(() => {
  //   console.log(audioPointData);
  // }, []);

  const addHotspotTag = () => {
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

  const deleteHotSpotTag = () => {
    // Ensure audioPointData exists
    if (!audioPointData) return;

    // Find the index of the audio point with the matching ID
    const audioPointIndex = element.audioPoint.findIndex(
      (point) => point.id === audioPointData
    );

    // If the audio point exists, remove it from the list
    if (audioPointIndex !== -1) {
      // Clone the current audio points
      const updatedAudioPoints = [...element.audioPoint];

      // Remove the audio point with the matching ID
      updatedAudioPoints.splice(audioPointIndex, 1);

      // Update the node in the editor with the updated audio points
      Transforms.setNodes(
        editor,
        { audioPoint: updatedAudioPoints },
        { at: path }
      );

      setAudioPointData(null);
    }
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
          onClick={addHotspotTag}
        >
          <Plus />
        </Button>
      </div>
      {audioPointData && (
        <div className="relative bg-accent p-4">
          <Button
            variant="outline"
            size="sm"
            className=" absolute right-3 top-3 h-[32px] border-red-400 text-red-500 hover:border-red-600 hover:bg-red-100/50 hover:text-red-600"
            onClick={deleteHotSpotTag}
          >
            Delete
          </Button>
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

          <label className="block pb-2 pt-4 text-sm">Label's Link</label>

          <input
            value={link}
            className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-white  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
            onChange={onChangeLink}
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
