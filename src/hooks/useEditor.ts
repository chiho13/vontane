// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";

export function useEditor() {
  return useMemo(() => withHistory(withColumns(withReact(createEditor()))), []);
}
