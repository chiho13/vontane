import React, { useRef, useEffect, useState } from "react";

import {
  VictoryBar,
  VictoryLine,
  VictoryArea,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryPie,
  VictoryLabel,
} from "victory";

import { useTheme as useStyledTheme } from "styled-components";

export const Charts = ({ element }) => {
  const transformedData =
    element.data &&
    element.data.map((row, index) => {
      return {
        x: row[0] ? row[0].value : 0,
        y: row[1] ? Number(row[1].value) : 0,
      };
    });

  const styledTheme = useStyledTheme();

  const colorScale = [
    "#FF3333", // Pyro: Vibrant Red
    "#3366FF", // Hydro: Deep Blue
    "#FFCC33", // Electro: Bright Yellow
    "#33FF66", // Dendro: Lush Green
    "#CC33FF", // Cryo: Cool Purple
    "#FF9933", // Geo: Earthy Orange
    "#66FFFF", // Anemo: Light Cyan
    "#FF9933", // Geo: Pure White
  ];

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const aspectRatio = (element.height / element.width) * 100;
  const calculatedHeight = (containerWidth * aspectRatio) / 100;

  return (
    <div
      ref={containerRef}
      className="w-full rounded-md bg-white py-1"
      style={{
        height: `${calculatedHeight}px`,
      }}
    >
      {element.chartType === "bar" && (
        <VictoryChart domainPadding={20}>
          <VictoryLabel
            text={element.chartTitle}
            x={225}
            y={30}
            textAnchor="middle"
            style={{ fontSize: 18 }}
          />
          <VictoryBar
            data={transformedData}
            style={{ data: { fill: styledTheme.brandColor } }}
          />
          <VictoryAxis
            label={element.xlabel}
            style={{
              tickLabels: {
                fontSize: 10,
                textAnchor: "start",
              },
              axisLabel: {
                padding: 30,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axisLabel: { padding: 50 },
              tickLabels: { fontSize: 10 },
            }}
            label={element.ylabel}
          />
        </VictoryChart>
      )}

      {element.chartType === "line" && (
        <VictoryChart domainPadding={20}>
          <VictoryLabel
            text={element.chartTitle}
            x={225}
            y={30}
            textAnchor="middle"
            style={{ fontSize: 18 }}
          />
          <VictoryLine
            data={transformedData}
            style={{ data: { stroke: styledTheme.brandColor } }}
          />
          <VictoryAxis
            label={element.xlabel}
            style={{
              tickLabels: {
                fontSize: 10,
                textAnchor: "start",
              }, // Adjust fontSize and angle as needed
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axisLabel: { padding: 50 },
              tickLabels: { fontSize: 10 },
            }}
            label={element.ylabel}
          />
        </VictoryChart>
      )}

      {element.chartType === "area" && (
        <VictoryChart domainPadding={20}>
          <VictoryLabel
            text={element.chartTitle}
            x={225}
            y={30}
            textAnchor="middle"
            style={{ fontSize: 18 }}
          />
          <VictoryArea
            data={transformedData}
            style={{ data: { fill: styledTheme.brandColor } }}
          />
          <VictoryAxis
            label={element.xlabel}
            style={{
              tickLabels: {
                fontSize: 10,
                textAnchor: "start",
              },
              axisLabel: {
                padding: 30,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axisLabel: { padding: 50 },
              tickLabels: { fontSize: 10 },
            }}
            label={element.ylabel}
          />
        </VictoryChart>
      )}

      {element.chartType === "scatterplot" && (
        <VictoryChart domainPadding={20}>
          <VictoryLabel
            text={element.chartTitle}
            x={225}
            y={30}
            textAnchor="middle"
            style={{ fontSize: 18 }}
          />
          <VictoryScatter
            data={transformedData}
            style={{ data: { fill: styledTheme.brandColor } }}
          />
          <VictoryAxis
            label={element.xlabel}
            style={{
              tickLabels: {
                fontSize: 10,
                textAnchor: "start",
              },
              axisLabel: {
                padding: 30,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axisLabel: { padding: 50 },
              tickLabels: { fontSize: 10 },
            }}
            label={element.ylabel}
          />
        </VictoryChart>
      )}

      {element.chartType === "pie" && (
        <VictoryPie
          data={transformedData}
          colorScale={colorScale}
          // style={{ data: { fill: styledTheme.brandColor } }}
        />
      )}

      {element.chartType === "donut" && (
        <VictoryPie
          data={transformedData}
          innerRadius={60} // This creates a hole in the middle to make it a donut chart
          colorScale={colorScale}
        />
      )}
    </div>
  );
};
