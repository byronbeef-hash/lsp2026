"use client";

import { useEffect } from "react";
import { useApiDataStore } from "@/stores/api-data";
import { useRecordsStore } from "@/stores/modules";

/**
 * ApiDataProvider — initializes the API data store on mount, and syncs
 * the transformed records into the existing module stores so all pages
 * automatically pick up API data without individual modifications.
 *
 * Place this alongside AuthProvider in the root layout.
 */
export function ApiDataProvider({ children }: { children: React.ReactNode }) {
  const initialize = useApiDataStore((s) => s.initialize);
  const isInitialized = useApiDataStore((s) => s.isInitialized);
  const isApiConnected = useApiDataStore((s) => s.isApiConnected);
  const apiRecords = useApiDataStore((s) => s.records);
  const setRecords = useRecordsStore((s) => s.setRecords);

  // Initialize API data on mount
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync API records into the module records store when available
  useEffect(() => {
    if (isInitialized && isApiConnected && apiRecords.length > 0) {
      setRecords(apiRecords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isApiConnected, apiRecords]);

  return <>{children}</>;
}
