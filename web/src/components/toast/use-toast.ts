import { createContext, useContext } from "react";

import type { useAnimatedToastStack } from "@/components/motion/animated-toast-stack";

type ToastStack = ReturnType<typeof useAnimatedToastStack>;

export type ToastContextValue = Pick<
  ToastStack,
  "showToast" | "updateToast" | "dismissToast" | "clearToasts"
>;

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
