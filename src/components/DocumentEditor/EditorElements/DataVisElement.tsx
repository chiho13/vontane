import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Descendant, Element as SlateElement, Node, Transforms } from "slate";

import { useContext, useState, useEffect } from "react";
import { VictoryBar, VictoryChart, VictoryAxis } from "victory";

import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { ReactEditor, useSelected } from "slate-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  BarChartBig,
  LineChart,
  PieChart,
  ScatterChart,
} from "lucide-react";
import { TbChartDonut2 } from "react-icons/tb";
import { OptionMenu } from "../OptionMenu";
import { useResizeBlock, Position } from "@/hooks/useResizeBlock";
import styled from "styled-components";
import { BlockAlign } from "@/components/BlockAlign";
import { cn } from "@/utils/cn";
import { useLocalStorage } from "usehooks-ts";

import Spreadsheet from "@/plugins/spreadsheet";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { FaPencilAlt } from "react-icons/fa";
import { useTheme } from "next-themes";

interface DataVisBlockElement {
  type: "dataVisBlock";
  chartType: string;
  children: Descendant[];
}

// Add it to your schema
declare module "slate" {
  interface CustomTypes {
    SlateElement: DataVisBlockElement;
  }
}

/** Gets the count of rows of given matrix */
export function getRowsCount(matrix): number {
  return matrix.length;
}

/** Gets the count of columns of given matrix */
export function getColumnsCount(matrix): number {
  const firstRow = matrix[0];
  return firstRow ? firstRow.length : 0;
}

export function getSize(matrix) {
  return {
    columns: getColumnsCount(matrix),
    rows: getRowsCount(matrix),
  };
}

const chartTypes = [
  { type: "bar", label: "Bar Chart", Icon: BarChartBig },
  { type: "line", label: "Line Chart", Icon: LineChart },
  { type: "pie", label: "Pie Chart", Icon: PieChart },
  { type: "area", label: "Area Chart", Icon: AreaChart },
  { type: "donut", label: "Donut", Icon: TbChartDonut2 },
  { type: "scatterplot", label: "Scatterplot", Icon: ScatterChart },
];

export const DataVisBlock = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const { elementData, setElementData, setShowRightSidebar, setTab } =
      useTextSpeech();
    const selected = useSelected();

    const { theme, resolvedTheme } = useTheme();

    // Default theme to 'system' and resolve to either 'light' or 'dark' based on system preference
    let currentTheme = theme === "system" ? resolvedTheme : theme;

    const isDarkMode = currentTheme === "dark";

    const [tab, setDataVisTab] = useLocalStorage(
      `tab-${element.id}`,
      element.tab
    );

    const { editor, setActivePath, setShowEditBlockPopup } =
      useContext(EditorContext);

    const path = ReactEditor.findPath(editor, element);
    const [align, setAlign] = useState(element.align || "start");

    const { handleMouseDown, setPos, ref, blockWidth, blockHeight } =
      useResizeBlock(element, editor, path);

    useEffect(() => {
      if (selected) {
        setElementData(element);
      }
    }, [selected]);

    const handleTabChange = (newTab) => {
      setDataVisTab(newTab);
    };

    const initialData = [
      [{ value: "0" }, { value: "0" }],
      [{ value: "1" }, { value: "3" }],
      [{ value: "2" }, { value: "5" }],
      [{ value: "3" }, { value: "4" }],
      [{ value: "4" }, { value: "7" }],
    ];

    const [data, setData] = useState(element.data);

    const [addingRowColumn, setAddingRowColumn] = useState(false);

    const transformedData = element.data.map((row, index) => {
      return { x: row[0].value, y: row[1] ? Number(row[1].value) : 0 };
    });

    const handleDataChange = debounce((changes) => {
      const newElement = {
        ...element,
        data: changes,
      };
      setData(changes);
      //   Transforms.setNodes(editor, newElement, { at: path });
    }, 700);

    const addColumn = React.useCallback(() => {
      setData((data) =>
        data.map((row) => {
          const nextRow = [...row];
          nextRow.length += 1;
          return nextRow;
        })
      );
      setAddingRowColumn(true);
    }, [setData]);

    const removeColumn = React.useCallback(() => {
      setData((data) =>
        data.map((row) => {
          return row.slice(0, row.length - 1);
        })
      );
      setAddingRowColumn(true);
    }, [setData]);

    const addRow = React.useCallback(() => {
      setData((data) => {
        const { columns } = getSize(data);
        return [...data, Array(columns)];
      });
      setAddingRowColumn(true);
    }, [setData]);

    const removeRow = React.useCallback(() => {
      setData((data) => {
        return data.slice(0, data.length - 1);
      });

      setAddingRowColumn(true);
    }, [setData]);

    useEffect(() => {
      Transforms.setNodes(
        editor,
        {
          ...element,
          data,
        },
        { at: path }
      );
    }, [addingRowColumn]);

    return (
      <div
        data-id={element.id}
        data-path={JSON.stringify(path)}
        className="mt-[5px]"
      >
        {!element.chartType ? (
          <div className="flex">
            <div
              className={`hover:bg-gray-muted relative mr-2  flex grow  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-secondary dark:hover:bg-background/70 
        hover:dark:bg-accent
        `}
              contentEditable={false}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditBlockPopup({
                  open: true,
                  element: "datavis",
                  path: JSON.stringify(path),
                });
                setActivePath(JSON.stringify(path));
              }}
            >
              <LineChart
                width={46}
                height={46}
                className="rounded-md opacity-30 dark:bg-transparent"
              />
              <span className="ml-4 opacity-30">Insert Data Visualisation</span>
              {children}
            </div>

            <div className=" right-1 top-1 z-10 mr-2 flex opacity-0 group-hover:opacity-100 ">
              <OptionMenu element={element} />
            </div>
          </div>
        ) : (
          <div
            className={` flex pr-2 justify-${align} `}
            {...attributes}
            contentEditable={false}
          >
            <div
              className={cn(
                `relative  flex w-full max-w-[660px] items-center  justify-center rounded-md  rounded-md border lg:max-w-[535px] xl:max-w-[680px]  ${
                  selected
                    ? "ring-2 ring-brand  ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-0 "
                    : "ring-black/40 ring-offset-white hover:ring-2 hover:ring-offset-2 dark:ring-offset-gray-300 "
                }`
              )}
              style={{
                width: blockWidth,
                height: blockHeight,
              }}
              tabIndex={-1}
              onMouseDown={() => {
                Transforms.select(editor, path);
                setShowRightSidebar(true);
                setTab("properties");
                Transforms.setNodes(
                  editor,
                  {
                    ...element,
                    data,
                  },
                  { at: path }
                );
              }}
              onBlur={() => {
                Transforms.setNodes(
                  editor,
                  {
                    ...element,
                    data,
                  },
                  { at: path }
                );
              }}
              ref={ref}
            >
              <Tabs
                value={tab}
                onValueChange={handleTabChange}
                className=" absolute top-0 mx-auto mb-0 w-full"
              >
                <TabsList
                  className={cn(
                    `ring-gray z-1000 ring-red absolute -top-[4px] left-0 right-0 z-10  mx-auto mt-2 grid   h-7 w-[200px] grid-cols-2 rounded-t-md  bg-gray-200 p-0 dark:bg-accent`
                  )}
                >
                  <TabsTrigger
                    value="preview"
                    className={`  text-xs data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
                  >
                    Preview
                  </TabsTrigger>

                  <TabsTrigger
                    value="data"
                    className={` text-xs data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
                  >
                    Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <div
                    className="absolute top-0 w-full bg-white"
                    style={{
                      height: blockHeight,
                    }}
                  >
                    {element.chartType === "bar" && (
                      <VictoryChart domainPadding={20}>
                        <VictoryBar data={transformedData} />
                      </VictoryChart>
                    )}

                    {!selected && (
                      <div
                        className={cn(
                          `absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center rounded-md  bg-slate-700 bg-opacity-30 opacity-0 transition-opacity hover:opacity-100`
                        )}
                        style={{
                          width: blockWidth - 2,
                          height: blockHeight - 2,
                        }}
                      >
                        <FaPencilAlt className="text-6xl text-white" />
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent
                  value="data"
                  className="scrollbar  mt-[40px] flex-grow overflow-y-auto p-5 "
                >
                  <div className={`${!selected && "pointer-events-none"}`}>
                    <div className="mb-2 flex gap-2">
                      <Button size="sm" onClick={addColumn}>
                        Add column
                      </Button>
                      <Button size="sm" onClick={addRow}>
                        Add row
                      </Button>
                      <Button size="sm" onClick={removeColumn}>
                        Remove column
                      </Button>
                      <Button size="sm" onClick={removeRow}>
                        Remove row
                      </Button>
                    </div>
                    <Spreadsheet
                      data={data}
                      onChange={handleDataChange}
                      darkMode={isDarkMode}
                    />
                  </div>

                  {!selected && (
                    <div
                      className={cn(
                        `absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center rounded-md  bg-slate-700  bg-opacity-30 opacity-0 transition-opacity hover:opacity-100`
                      )}
                      style={{
                        width: blockWidth - 2,
                        height: blockHeight - 2,
                      }}
                    >
                      <FaPencilAlt className="text-6xl text-white" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              <div
                className={`absolute -right-[3px] top-0 flex h-full items-center`}
                onMouseDown={() => {
                  handleMouseDown();
                  setPos(Position.Right);
                }}
              >
                <div
                  className={`  flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
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
                  className={`  flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
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

              <div className="absolute  right-1 top-1 z-10 flex gap-1">
                <BlockAlign element={element} />
                <div className="flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white">
                  <OptionMenu element={element} />
                </div>
              </div>
            </div>

            {children}
          </div>
        )}
      </div>
    );
  }
);

export const SelectDataVis = () => {
  const { editor, activePath, setShowEditBlockPopup } =
    useContext(EditorContext);
  const handleChartTypeChange = (chartType: string) => {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    const initialData = [
      [{ value: "0" }, { value: "0" }],
      [{ value: "1" }, { value: "3" }],
      [{ value: "2" }, { value: "5" }],
      [{ value: "3" }, { value: "4" }],
      [{ value: "4" }, { value: "7" }],
    ];
    const newElement = {
      ...currentElement,
      align: "start",
      tab: "preview",
      data: initialData,
      chartType,
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    setShowEditBlockPopup({
      open: false,
      element: null,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-2">
      {chartTypes.map(({ type, label, Icon }) => (
        <button
          key={type}
          className="flex flex-col items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => handleChartTypeChange(type)}
        >
          <Icon className="mb-2 mt-1 h-8 w-8" />
          {label}
        </button>
      ))}
    </div>
  );
};
