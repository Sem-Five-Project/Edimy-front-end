  import React from "react";

  // Use the root-level React Query Provider from app/layout.tsx to ensure
  // a single QueryClient and shared cache across Home, Profile, and Find Tutor.
  export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
