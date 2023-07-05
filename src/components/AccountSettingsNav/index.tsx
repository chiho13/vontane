"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarNavItem } from "@/types";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/Icons";
import { LogoutIcon } from "@/icons/Logout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
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
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition duration-300 hover:bg-accent hover:text-black dark:text-foreground"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Workspaces</span>
        </span>
      </Link>

      <div>
        {items.map((item, index) => {
          return (
            item.href && (
              <Link key={index} href={item.disabled ? "/" : item.href}>
                <span
                  className={cn(
                    "group mt-1 flex items-center rounded-md px-3 py-2 text-sm font-medium  text-gray-600 transition duration-300 hover:bg-accent dark:text-foreground",
                    path === item.href
                      ? "bg-accent dark:text-foreground "
                      : "transparent",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
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
            "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium  text-gray-600 transition duration-300 hover:bg-accent hover:text-black dark:text-foreground"
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
