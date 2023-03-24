export function mergeRefs(...refs: any[]) {
  return function (_ref: any) {
    for (const ref of refs) {
      if ("current" in ref) {
        ref.current = _ref;
        continue;
      }

      if (typeof ref === "function") {
        ref(_ref);
        continue;
      }

      throw new Error("ref is not injectable.");
    }
  };
}
