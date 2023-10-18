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
  };

  return (
    <div>
      <div className="relative bg-accent p-4">
        <h3 className="text-bold mb-3 text-sm text-gray-500 dark:text-gray-400">
          Line, Bar and Pie Charts
        </h3>

        <div className="flex gap-4">
          <Select onValueChange={onChangeChartType} value={chartType}>
            <SelectTrigger className="h-[36px] w-[180px]">
              <SelectValue />
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
        </div>
      </div>
    </div>
  );
};
