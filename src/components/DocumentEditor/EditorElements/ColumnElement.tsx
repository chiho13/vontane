import { ReactNode } from "react";

interface ColumnElementProps {
  children: ReactNode;
}

export function ColumnElement({ children }: ColumnElementProps) {
  return <div>{children}</div>;
}
