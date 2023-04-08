import { on } from "events";
import React, { useState, useEffect } from "react";

type ErrorAlertProps = {
  message: string;
  alertType?: "error" | "success" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  alertType = "error",
  duration = 10000,
  onClose,
}) => {
  const alertClasses = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`relative rounded border px-4 py-3 transition-opacity duration-500 ease-in-out ${alertClasses[alertType]}`}
      role="alert"
    >
      <strong className="font-bold">{alertType.toUpperCase()}!</strong>
      <span className="block sm:inline"> {message}</span>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={onClose}
      >
        <svg
          className="h-6 w-6 fill-current"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
};
