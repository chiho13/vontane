"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarNavItem } from "@/types";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/Icons";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  const ArrowLeft = Icons.arrowLeft;

  return (
    <nav className="grid items-start gap-2">
      <Link href="/" className="mb-6">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm  font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-black"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Workspaces</span>
        </span>
      </Link>
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        return (
          item.href && (
            <Link key={index} href={item.disabled ? "/" : item.href}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm  font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-black",
                  path === item.href ? "bg-gray-200 text-black" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
}
