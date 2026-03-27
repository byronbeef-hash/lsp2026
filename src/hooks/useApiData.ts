"use client";

import { useEffect } from "react";
import { useApiDataStore } from "@/stores/api-data";

/**
 * Hook that initializes the API data store on mount.
 *
 * - If the user is authenticated via the API (JWT in localStorage), fetches
 *   real data from livestockpro.app and transforms it into the app's types.
 * - If not authenticated, loads mock data so the demo still works.
 * - Returns the store state and a refresh() function to force re-fetch.
 */
export function useApiData() {
  const store = useApiDataStore();

  useEffect(() => {
    store.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    records: store.records,
    medicalBatches: store.medicalBatches,
    paddocks: store.paddocks,
    salesRecords: store.salesRecords,
    rainGaugeReadings: store.rainGaugeReadings,
    calendarEvents: store.calendarEvents,
    todos: store.todos,
    breeds: store.breeds,
    groups: store.groups,
    weightHistory: store.weightHistory,
    breedDistribution: store.breedDistribution,
    recentActivity: store.recentActivity,
    dashboardStats: store.dashboardStats,
    animalWeightHistory: store.animalWeightHistory,

    // Flags
    isLoading: store.isLoading,
    error: store.error,
    isApiConnected: store.isApiConnected,
    isInitialized: store.isInitialized,

    // Actions
    refresh: store.refresh,
  };
}
