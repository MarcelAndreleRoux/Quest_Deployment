"use client";

import { AuthProvider } from "react-oidc-context";
import { CognitoAuthConfig } from "@/lib/auth";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Move viewport logic into a client-side effect
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider {...CognitoAuthConfig}>
      <html lang="en">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
          <meta name="theme-color" content="#000000" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Main Content */}
            {children}
            <RegisterSW />
        </body>
      </html>
    </AuthProvider>
  );
}
