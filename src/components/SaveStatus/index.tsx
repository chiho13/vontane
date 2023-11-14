// SyncStatusIndicator.tsx
import { syncStatusStore } from "@/store/sync";
import React from "react";

export const SyncStatusIndicator = () => {
  const { syncStatus } = syncStatusStore();

  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-100  px-2 py-1  text-xs text-slate-500 dark:border-gray-600 dark:bg-accent dark:text-slate-200">
      <div
        className={`h-2 w-2 rounded-full transition duration-200 
          ${syncStatus === "syncing" ? "bg-yellow-500" : "bg-green-500"}
        `}
      ></div>
      {syncStatus === "syncing"
        ? "Saving"
        : syncStatus === "synced"
        ? "Saved"
        : ""}
    </div>
  );
};
