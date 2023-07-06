// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo, useRef } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Path, Range, Transforms } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";
import { withTitle, withCustomDelete } from "@/hoc/withTitle";
import { genNodeId } from "@/hoc/withID";
import isUrl from "is-url";
import { withNormalizePasting } from "@/hoc/withPasting";
import { withImages } from "@/hoc/withImages";

export function useEditor() {
  const editor = useMemo(
    () =>
      withImages(
        withNormalizePasting(
          withCustomDelete(withTitle(withHistory(withReact(createEditor()))))
        )
      ),
    []
  );
  return editor;
}
