import { useMemo, type ReactNode } from "react";

import {
  AnimatedToastStack,
  useAnimatedToastStack,
} from "@/components/motion/animated-toast-stack";
import { ToastContext } from "@/components/toast/use-toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, updateToast, dismissToast, clearToasts } =
    useAnimatedToastStack();

  const actions = useMemo(
    () => ({ showToast, updateToast, dismissToast, clearToasts }),
    [showToast, updateToast, dismissToast, clearToasts],
  );

  return (
    <ToastContext value={actions}>
      {children}
      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="bottom-right"
        fixed
      />
    </ToastContext>
  );
}
