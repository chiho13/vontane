interface DashboardHeaderProps {
  heading: string;
  text?: string;
}
import React from "react";
export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1">
        <h1 className="font-heading text-bold text-3xl  text-foreground md:text-4xl">
          {heading}
        </h1>
        {text && <p className="text-lg text-gray-400">{text}</p>}
      </div>
    </div>
  );
}
