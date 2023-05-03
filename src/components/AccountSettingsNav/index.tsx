"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarNavItem } from "@/types";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/Icons";
import { LogoutIcon } from "@/icons/Logout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();

  const supabase = useSupabaseClient();
  async function logout() {
    await supabase.auth.signOut();
  }

  if (!items?.length) {
    return null;
  }

  const ArrowLeft = Icons.arrowLeft;

  return (
    <nav className="relative grid items-start gap-2">
      <Link href="/" className="relative mb-6">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm  font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-black"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Workspaces</span>
        </span>
      </Link>

      <div>
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          return (
            item.href && (
              <Link key={index} href={item.disabled ? "/" : item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm  font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-black",
                    path === item.href
                      ? "bg-gray-200 text-black"
                      : "transparent",
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
      </div>
      <div className=" relative bottom-0 mt-20 w-full">
        <button
          className={cn(
            "group flex w-full items-center rounded-md px-3 py-2 text-sm  font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-black"
          )}
          onClick={logout}
        >
          <LogoutIcon />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
}
