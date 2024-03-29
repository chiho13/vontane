import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";

import { useTheme } from "next-themes";

import { Map, Marker, Draggable, Point, ZoomControl } from "pigeon-maps";
import { maptiler } from "pigeon-maps/providers";
import { MapPin, Settings } from "lucide-react";
import Image from "next/image";
import { Transforms } from "slate";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { OptionMenu } from "../OptionMenu";
import { Position, useResizeBlock } from "@/hooks/useResizeBlock";
import { block } from "million";
import { BlockAlign } from "@/components/BlockAlign";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";

export function Mapbox(props) {
  const { activePath, setActivePath } = useContext(EditorContext);

  const { editor } = useContext(SlateEditorContext);

  const { setElementData, setShowRightSidebar, setTab, showRightSidebar } =
    useTextSpeech();
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const { theme, resolvedTheme } = useTheme();

  // Default theme to 'system' and resolve to either 'light' or 'dark' based on system preference
  let currentTheme = theme === "system" ? resolvedTheme : theme;

  const isDarkMode = currentTheme === "dark";

  const selected = useSelected();
  const defaultZoom = 11;
  const MAPTILER_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const MAP_ID = isDarkMode ? "streets-v2-dark" : "streets-v2";

  const { handleMouseDown, setPos, ref, blockWidth, blockHeight } =
    useResizeBlock(element, editor, path);

  const maptilerProvider = maptiler(MAPTILER_ACCESS_TOKEN, MAP_ID);

  const [zoom, setZoom] = useState(element.zoom || 11);
  const [anchor, setAnchor] = useState<Point>(
    element.latLng || [50.879, 4.6997]
  );

  const [align, setAlign] = useState(element.align || "start");

  function setLatLng(newLatLng) {
    setAnchor(newLatLng);
    getLocationName(newLatLng);
    // Set new timer
    setTimeout(() => {
      Transforms.setNodes(editor, { latLng: newLatLng, zoom }, { at: path });
    }, 500);
  }

  useEffect(() => {
    if (selected) {
      setElementData(element);
    }
  }, [selected]);

  const locationNameMutation = api.gpt.locationName.useMutation();

  async function getLocationName(latLng) {
    try {
      const response = await locationNameMutation.mutateAsync({
        lat: latLng[0],
        lng: latLng[1],
      });

      const address = response.features[0].place_name;

      Transforms.setNodes(editor, { address }, { at: path });
    } catch (error) {}
  }

  return (
    <div
      className={` group flex justify-${align} outline-none`}
      {...attributes}
      tabIndex={-1}
    >
      <div
        className={`group relative rounded-md`}
        style={{
          overflow: "hidden",
          width: blockWidth,
          maxWidth: 680,
          height: blockHeight,
          userSelect: "none",
        }}
        ref={ref}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        tabIndex={-1}
        contentEditable={false}
        onMouseDown={() => {
          ReactEditor.blur(editor);
        }}
      >
        <div
          className={`absolute -right-[3px] top-0 flex h-full items-center`}
          onMouseDown={() => {
            handleMouseDown();
            setPos(Position.Right);
          }}
        >
          <div
            className={`  z-10 flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
          >
            <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-white bg-[#191919] opacity-70 dark:bg-background"></div>
          </div>
        </div>
        <div
          className={`absolute -left-[3px] top-0 flex h-full items-center`}
          onMouseDown={() => {
            handleMouseDown();
            setPos(Position.Left);
          }}
        >
          <div
            className={`  z-10 flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
          >
            <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-white bg-[#191919] opacity-70 dark:bg-background"></div>
          </div>
        </div>
        <div
          className={`absolute -bottom-[3px] left-0 right-0 flex `}
          onMouseDown={() => {
            handleMouseDown();
            setPos(Position.Bottom);
          }}
        >
          <div
            className={`  z-10 flex h-[18px]  w-full items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
          >
            <div className="mx-auto block h-[6px] w-[60px]  cursor-row-resize rounded-lg border border-white bg-[#191919] opacity-70 dark:bg-background"></div>
          </div>
        </div>
        <div className="absolute  right-2 top-1 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 ">
          <BlockAlign element={element} />
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              Transforms.select(editor, path);
              if (!showRightSidebar) {
                setShowRightSidebar(true);
                setTab("properties");
              }
            }}
            className="group h-[24px] w-[24px] border border-gray-100 bg-white px-0 hover:border-gray-200 hover:bg-gray-200 dark:border-gray-700 dark:bg-muted hover:dark:bg-muted/90"
            style={{
              zIndex: 1000,
            }}
            contentEditable={false}
          >
            <Settings className="w-4 stroke-muted-foreground hover:stroke-muted-foreground dark:stroke-foreground" />
          </Button>

          <OptionMenu element={element} className="bg-white" />
        </div>
        <Map
          provider={maptilerProvider}
          dprs={[1, 2]}
          center={anchor}
          zoom={zoom}
          attribution={false}
          onClick={(el) => {
            el.event.stopPropagation();
            setLatLng(el.latLng);
            Transforms.select(editor, path);
          }}
          onBoundsChanged={({ center, zoom }) => {
            setZoom(zoom);
            // Transforms.setNodes(editor, { zoom }, { at: path });
          }}
          metaWheelZoom={true}
          animate={true}
        >
          <ZoomControl />
          <Draggable
            offset={[25, 50]}
            anchor={anchor}
            onDragEnd={(value) => {
              setLatLng(value);
              Transforms.select(editor, path);
            }}
          >
            <MapPin
              size={50}
              className="fill-white stroke-brand dark:fill-brand dark:stroke-white"
              // fill={isDarkMode ? "#191919" : "white"}
              strokeWidth={1.5}
            />
          </Draggable>

          <a
            href="https://www.maptiler.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 left-0"
          >
            <Image
              src={`/images/maptiler-logo${isDarkMode ? "-white" : ""}.png`}
              width={100}
              height={40}
              alt="map tiler"
            />
          </a>
        </Map>
        {children}
      </div>
    </div>
  );
}
