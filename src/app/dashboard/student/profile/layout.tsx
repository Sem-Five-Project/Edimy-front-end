import React from "react";
import ReactQueryProvider from "@/app/providers/react-query-provider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
