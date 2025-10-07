"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { getCurrentAdmin, AdminUser } from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminData = await getCurrentAdmin();
        setAdmin(adminData);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        // Keep default fallback data if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fallback user data
  const USER = {
    name: admin ? `${admin.firstName} ${admin.lastName}` : "Admin User",
    email: admin?.email || "admin@edimy.com",
    img: admin?.profileImage || "/images/user/user-03.png",
    initials: admin ? `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}` : "AU"
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <div className="relative size-12">
            {admin?.profileImage ? (
              <Image
                src={admin.profileImage}
                className="size-12 rounded-full object-cover"
                alt={`Avatar of ${USER.name}`}
                role="presentation"
                width={48}
                height={48}
              />
            ) : (
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {USER.initials}
              </div>
            )}
            {!isLoading && admin?.enabled && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{isLoading ? "Loading..." : USER.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-900 min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <div className="relative size-12">
            {admin?.profileImage ? (
              <Image
                src={admin.profileImage}
                className="size-12 rounded-full object-cover"
                alt={`Avatar for ${USER.name}`}
                role="presentation"
                width={48}
                height={48}
              />
            ) : (
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {USER.initials}
              </div>
            )}
          </div>

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {isLoading ? "Loading..." : USER.name}
            </div>

            <div className="leading-none text-gray-6">{isLoading ? "..." : USER.email}</div>
            
            {admin?.role && (
              <div className="text-xs text-primary font-medium uppercase tracking-wide">
                {admin.role}
              </div>
            )}
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/dashboard/admin/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
