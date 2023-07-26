import { useState } from "react";

import { useTheme } from "next-themes";

import { Map, Marker, ZoomControl } from "pigeon-maps";
import { maptiler } from "pigeon-maps/providers";
import { MapPin, Settings, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export function MapBlock(props) {
  const { element } = props;

  const { theme, resolvedTheme } = useTheme();

  // Default theme to 'system' and resolve to either 'light' or 'dark' based on system preference
  let currentTheme = theme === "system" ? resolvedTheme : theme;

  const isDarkMode = currentTheme === "dark";

  const MAPTILER_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const MAP_ID = isDarkMode ? "streets-v2-dark" : "streets-v2";

  const maptilerProvider = maptiler(MAPTILER_ACCESS_TOKEN, MAP_ID);

  const [zoom, setZoom] = useState(element.zoom || 11);

  return (
    <div className={` mb-5 mt-5 flex justify-${element.align}`}>
      <div
        className="group relative  rounded-md"
        tabIndex={-1}
        style={{
          overflow: "hidden",
          width: element.width,
          maxWidth: 710,
          height: element.height,
        }}
        data-id={element.id}
      >
        <Map
          provider={maptilerProvider}
          dprs={[1, 2]}
          center={element.latLng}
          zoom={zoom}
          attribution={false}
          onBoundsChanged={({ zoom }) => {
            setZoom(zoom);
          }}
          metaWheelZoom={true}
        >
          <ZoomControl />
          <Marker offset={[10, 15]} anchor={element.latLng}>
            <MapPin
              size={50}
              className="fill-white stroke-brand dark:fill-brand dark:stroke-white"
              // fill={isDarkMode ? "#191919" : "white"}
              strokeWidth={1.5}
            />
          </Marker>

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
          <Link
            href={`https://www.google.com/maps/?q=${element.latLng[0]},${element.latLng[1]}`}
            target="_blank"
          >
            <Button
              variant="outline"
              className="absolute bottom-2 right-2 h-[32px] w-[32px] border bg-accent p-0 "
              size="xs"
            >
              <MapIcon className="w-5" />
            </Button>
          </Link>
        </Map>
      </div>
    </div>
  );
}
