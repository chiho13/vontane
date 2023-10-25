import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "../ui/input";
import { api } from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { Transforms, Node } from "slate";
import { useContext, useEffect, useState } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Plus, Search, Trash } from "lucide-react";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { LayoutContext } from "../Layouts/AccountLayout";
import { useRouter } from "next/router";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import Link from "next/link";
import { HexColorPicker, HexColorInput } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sideBarStore } from "@/store/sidebar";
import { IconPicker } from "../IconPicker";

export const ImageSettings = ({ element }) => {
  const router = useRouter();
  const { updatedWorkspace } = useWorkspaceTitleUpdate();
  const workspaceId = router.query.workspaceId as string;
  const { editor } = useContext(SlateEditorContext);
  const { allWorkspaces } = useContext(LayoutContext);
  // const { audioPointData, setAudioPointData } = useTextSpeech();
  const { audioPointData, setAudioPointData } = sideBarStore();

  const [altText, setAltText] = useState(element.altText ?? null);

  const [hotspotLabel, setHotspotLabel] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [link, setLink] = useState(null);

  const [hotspotColor, setHotspotColor] = useState("#ffffff");

  const path = ReactEditor.findPath(editor, element);

  const filteredWorkspaces = allWorkspaces.filter(
    (workspace) => workspace.id !== workspaceId
  );

  useEffect(() => {
    if (element.altText) {
      setAltText(element.altText);
    }

    return () => {
      setAltText("");
    };
  }, [element]);

  useEffect(() => {
    // Find the audio point corresponding to the active ID
    if (!element.audioPoint) return;
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

    if (activeAudioPoint && activeAudioPoint.colour) {
      console.log(activeAudioPoint.colour);
      setHotspotColor(activeAudioPoint.colour);
    } else {
      setHotspotColor("#ffffff");
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

  const onChangeWidget = (value) => {
    console.log(value);
    setLink(value);
    updateAudioPoint("link", value);
  };

  const onChangeHotspotColour = (value) => {
    const newColor = value;
    setHotspotColor(newColor);
    updateAudioPoint("colour", newColor);
  };

  // useEffect(() => {
  //   console.log(audioPointData);
  // }, []);

  const addHotspotTag = () => {
    // If audioPoint is not defined or null, default to an empty array
    const currentAudioPoints = element.audioPoint || [];

    const randomX = Math.floor(Math.random() * 61) + 20;
    const randomY = Math.floor(Math.random() * 61) + 20;

    // Create a new audio point
    const newAudioPoint = {
      id: genNodeId(),
      type: "original",
      colour: "#ffffff",
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
        <h2 className="mb-3 text-sm font-bold">Image Settings</h2>

        <h3 className="mb-1 mt-4 text-sm font-bold text-gray-500 dark:text-gray-400">
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
          Insert Hotspot
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
            className=" absolute right-3 top-3 h-[32px] w-[32px]  border border-red-400 px-1 text-red-500 hover:border-red-600 hover:bg-red-100/50 hover:text-red-600"
            onClick={deleteHotSpotTag}
          >
            <Trash className="w-[18px]" />
          </Button>
          <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            Hotspot Popup Content
          </h3>
          {/* <div className="text-gray-500">ID: {audioPointData}</div> */}

          <div className="mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 border border-gray-300  bg-white px-[6px] text-gray-700 dark:border-accent dark:bg-muted  dark:text-gray-200 "
                >
                  <span
                    className="h-[24px] w-[24px] rounded-md border"
                    style={{
                      backgroundColor: hotspotColor,
                    }}
                  ></span>
                  Hotspot Colour <ChevronDown className="w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={10}
                className=" w-auto border border-gray-300 bg-background  p-2 dark:border-gray-700  dark:bg-muted "
              >
                <HexColorPicker
                  color={hotspotColor}
                  onChange={onChangeHotspotColour}
                />
                {/* <div className="mb-1 mt-2 w-full">
                  <HexColorInput
                    color={hotspotColor}
                    onChange={debounce(onChangeHotspotColour, 400)}
                    className="h-[32px] w-full rounded-md  border border-neutral-300 px-1"
                  />
                </div> */}
              </PopoverContent>
            </Popover>
          </div>

          <label className="block pb-2 pt-4 text-sm  font-semibold">
            Change Icon
          </label>

          <IconPicker />

          <label className="block pb-2 pt-2 text-sm  font-semibold">
            Title
          </label>

          <Input
            value={hotspotLabel}
            className=" h-[36px]  w-full rounded-md  border border-gray-300 bg-white p-2 text-sm focus:outline-none  dark:border-gray-400 dark:bg-muted dark:text-gray-400"
            onChange={onChangeHotspotLabel}
          />

          <label className="block pb-2 pt-4 text-sm font-semibold">
            Embed Widget
          </label>

          {/* <input
            value={link}
            className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-white  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
            onChange={onChangeLink}
          /> */}

          <div className="flex gap-4">
            <Select onValueChange={onChangeWidget} value={link}>
              <SelectTrigger className="h-[36px] w-[180px]">
                {link ? (
                  <SelectValue />
                ) : (
                  <span className="placeholder">Select a Widget</span>
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto dark:border-neutral-800 dark:bg-background">
                <SelectGroup>
                  {filteredWorkspaces.map((workspace) => {
                    const parsedSlateValue = JSON.parse(
                      workspace.slate_value as any
                    );

                    const workspaceName = parsedSlateValue[0].children[0].text;
                    const displayName =
                      updatedWorkspace && updatedWorkspace.id === workspace.id
                        ? updatedWorkspace.title
                        : workspaceName;
                    return (
                      <SelectItem
                        key={workspace.id}
                        value={workspace.id}
                        className="w-[300px]"
                      >
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            {link && (
              <Link href={`/docs/${link}`} target="_blank">
                <Button
                  className="flex h-[36px] gap-1 border border-input bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-background dark:hover:bg-muted"
                  size="sm"
                  variant="outline"
                >
                  Edit <ArrowUpRight />
                </Button>
              </Link>
            )}
          </div>

          {/* <label className="block pb-2 pt-4 text-sm">Audio URL</label>

          <input
            value={audioURL}
            className=" h-[36px]  w-full rounded-md  border border-gray-300  bg-white  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
            onChange={onChangeAudioURL}
          /> */}
        </div>
      )}
    </div>
  );
};
