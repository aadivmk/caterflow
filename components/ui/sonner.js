"use client";

import { Toaster as Sonner } from "sonner";

function Toaster(props) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
      {...props}
    />
  );
}

export { Toaster };
