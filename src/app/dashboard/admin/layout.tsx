import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";


export const metadata: Metadata = {
  title: {
    template: "%s | Edimy Admin - Education Platform",
    default: "Edimy Admin - Education Platform",
  },
  description:
    "Edimy admin dashboard for managing tutors, students, sessions, and educational content.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
            <Header />

            <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
