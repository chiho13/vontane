// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor } from "slate";

import { withID } from "@/hoc/withID";

export function useEditor() {
  return useMemo(() => withID(withReact(createEditor())), []);
}
