import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";

import { useTheme } from "next-themes";

import { Map, Marker, Draggable, Point } from "pigeon-maps";
import { maptiler } from "pigeon-maps/providers";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { Transforms } from "slate";
import { debounce } from "lodash";

export function Mapbox(props) {
  const { editor, activePath } = useContext(EditorContext);

  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const { theme } = useTheme();

  const isDarkMode = theme === "dark";

  const defaultZoom = 11;
  const MAPTILER_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const MAP_ID = isDarkMode ? "streets-v2-dark" : "streets-v2";

  const maptilerProvider = maptiler(MAPTILER_ACCESS_TOKEN, MAP_ID);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [previousAnchor, setPreviousAnchor] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldCenter(true);
    }, 500); // Change this to set your delay in milliseconds

    // Cleanup function to clear the timer when component unmounts
    return () => clearTimeout(timer);
  }, []);

  const [zoom, setZoom] = useState(element.zoom || 11);
  const [anchor, setAnchor] = useState<Point>(
    element.latLng || [50.879, 4.6997]
  );

  useEffect(() => {
    if (!shouldCenter) {
      setPreviousAnchor(anchor);
    }
  }, [shouldCenter, anchor]);

  function setLatLng(newLatLng) {
    setAnchor(newLatLng);

    // Set new timer
    setTimeout(() => {
      Transforms.setNodes(editor, { latLng: newLatLng, zoom }, { at: path });
    }, 300);
  }

  console.log(anchor);

  return (
    <div
      className="relative rounded-md"
      style={{
        overflow: "hidden",
        width: "100%",
        height: "400px",
      }}
      data-id={element.id}
      data-path={JSON.stringify(path)}
    >
      <Map
        provider={maptilerProvider}
        dprs={[1, 2]}
        center={anchor}
        zoom={zoom}
        attribution={false}
        onClick={(el) => {
          console.log(el.latLng);
          setLatLng(el.latLng);
        }}
        onBoundsChanged={({ center, zoom }) => {
          setZoom(zoom);
          // Transforms.setNodes(editor, { zoom }, { at: path });
        }}
      >
        <Draggable offset={[25, 50]} anchor={anchor} onDragEnd={setLatLng}>
          <MapPin
            size={50}
            className="fill-white stroke-brand dark:fill-muted dark:stroke-white"
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
  );
}
