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

export const DataVisSettings = ({ element }) => {
  const router = useRouter();
  const { updatedWorkspace } = useWorkspaceTitleUpdate();
  const workspaceId = router.query.workspaceId as string;
  const { editor, activePath } = useContext(EditorContext);

  const [chartType, setChartType] = useState(element.chartType);

  const path = ReactEditor.findPath(editor, element);

  useEffect(() => {
    if (element.chartType) {
      setChartType(element.chartType);
    }

    return () => {
      setChartType("");
    };
  }, [element]);

  const onChangeChartType = (value) => {
    console.log(value);
    Transforms.setNodes(editor, { ...element, chartType: value }, { at: path });
  };

  return (
    <div>
      <div className="relative bg-accent p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
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
    </div>
  );
};
