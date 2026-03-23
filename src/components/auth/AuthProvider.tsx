"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth";

/**
 * AuthProvider — initializes the Supabase auth session on mount and keeps the
 * Zustand auth store in sync with onAuthStateChange events for the lifetime of
 * the app. Place this high in the component tree (root layout) so every page
 * shares the same auth state without re-initializing.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  // Use a ref so we can clean up the Supabase subscription on unmount without
  // holding a stale closure over the unsubscribe function.
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    initialize().then((unsubscribe) => {
      if (cancelled) {
        // Component unmounted before initialize resolved — clean up immediately
        unsubscribe();
        return;
      }
      unsubscribeRef.current = unsubscribe;
    });

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
    // initialize is stable (created once by Zustand) — exhaustive-deps lint
    // rule would flag this, but it is safe to omit here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
