"use client";

import { createContext, useCallback, useContext, ReactNode } from "react";

interface DatasetContextType {
  activeDataset: string;
  setActiveDataset: (id: string) => void;
}

const DatasetContext = createContext<DatasetContextType>({
  activeDataset: "A",
  setActiveDataset: () => {},
});

export function DatasetProvider({ children }: { children: ReactNode }) {
  const setActiveDataset = useCallback((_id: string) => {
    // Dataset selection is intentionally fixed to A for non-pipeline pages.
  }, []);

  return (
    <DatasetContext.Provider value={{ activeDataset: "A", setActiveDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
