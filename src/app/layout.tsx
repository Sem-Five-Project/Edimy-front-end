import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext"; // <-- import AuthProvider
import { ThemeProvider } from "../contexts/ThemeContext"; // <-- import ThemeProvider
import ReactQueryProvider from "./providers/react-query-provider"; // <-- import ReactQueryProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edimy Education",
  description: "Tutor and student connecting...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            {/* <ThemeProvider> */}
              {children}
            {/* </ThemeProvider> */}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
