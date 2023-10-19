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
import {
  AreaChart,
  BarChartBig,
  LineChart,
  PieChart,
  ScatterChart,
} from "lucide-react";
import { TbChartDonut2 } from "react-icons/tb";

import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";

import { ReactEditor } from "slate-react";

import { useRouter } from "next/router";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import Link from "next/link";
import { chartTypes } from "../DocumentEditor/EditorElements";
import { Transforms } from "slate";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { debounce } from "lodash";

export const DataVisSettings = ({ element }) => {
  const router = useRouter();
  const { updatedWorkspace } = useWorkspaceTitleUpdate();
  const workspaceId = router.query.workspaceId as string;
  const { editor, activePath } = useContext(EditorContext);

  const [chartType, setChartType] = useState(element.chartType);

  const [xaxis, setxaxis] = useState(element.xlabel);
  const [yaxis, setyaxis] = useState(element.ylabel);

  const path = ReactEditor.findPath(editor, element);
  const [chartTitle, setChartTitle] = useState(element.setChartTitle);

  useEffect(() => {
    if (element.chartType) {
      setChartType(element.chartType);
    }

    if (element.chartTitle) {
      setChartTitle(element.chartTitle);
    }

    if (element.yaxis) {
      setyaxis(element.ylabel);
    }

    if (element.xaxis) {
      setxaxis(element.xlabel);
    }

    return () => {
      setChartType("");
      setChartTitle("");
      setyaxis("");
      setxaxis("");
    };
  }, [element]);

  const onChangeChartType = (value) => {
    console.log(value);
    Transforms.setNodes(editor, { ...element, chartType: value }, { at: path });
  };

  const onChangeChartTitle = (e) => {
    Transforms.setNodes(
      editor,
      { ...element, chartTitle: e.target.value },
      { at: path }
    );
  };

  const onChangeChartXLabel = (e) => {
    Transforms.setNodes(
      editor,
      { ...element, xlabel: e.target.value },
      { at: path }
    );
  };

  const onChangeChartYLabel = (e) => {
    Transforms.setNodes(
      editor,
      { ...element, ylabel: e.target.value },
      { at: path }
    );
  };

  return (
    <div>
      <div className="relative border-b p-4">
        <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          Chart Type
        </h3>

        <div className="flex gap-4">
          <Select onValueChange={onChangeChartType} value={chartType}>
            <SelectTrigger className="h-[36px] w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto dark:border-neutral-800 dark:bg-background">
              <SelectGroup>
                {chartTypes.map((chartType, index) => {
                  return (
                    <SelectItem
                      key={index}
                      value={chartType.type}
                      className="w-[300px]"
                    >
                      {chartType.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border-b p-4 dark:border-input">
        <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          Title
        </h3>

        <Input
          defaultValue={chartTitle}
          type="text"
          onChange={onChangeChartTitle}
          className="mt-2 "
        />
      </div>
      <div className="border-b p-4 dark:border-input">
        <h3 className="mb-2 mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Bar, Line, Scatter Chart Labels
        </h3>

        <div className="mb-4">
          <Label className="mt-2 font-bold">X-Axis label</Label>
          <Input
            defaultValue={xaxis}
            type="text"
            onChange={onChangeChartXLabel}
            className="mt-2 "
          />
        </div>

        <div>
          <Label className="mt-2 font-bold">Y-Axis label</Label>
          <Input
            defaultValue={yaxis}
            type="text"
            onChange={onChangeChartYLabel}
            className="mt-2 "
          />
        </div>
      </div>
    </div>
  );
};
