"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DatasetContextType {
  activeDataset: string;
  setActiveDataset: (id: string) => void;
}

const DatasetContext = createContext<DatasetContextType>({
  activeDataset: "A",
  setActiveDataset: () => {},
});

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [activeDataset, setActiveDataset] = useState("A");
  return (
    <DatasetContext.Provider value={{ activeDataset, setActiveDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
