"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const registerSW = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            }
          );

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New content available; please refresh.");
                  } else {
                    console.log("Content is cached for offline use.");
                  }
                }
              };
            }
          };
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      }
    };

    window.addEventListener("load", registerSW);

    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, []);

  return null;
}
