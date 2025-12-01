import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { SliceImport } from "./types";

interface ImportSlicesContextValue {
  selectedLocalSlices: ComponentUI[];
  selectedLibrarySlices: SliceImport[];
  toggleLocalSlice: (slice: ComponentUI) => void;
  toggleLibrarySlice: (slice: SliceImport) => void;
  setAllLibrarySlices: (slices: SliceImport[]) => void;
  reset: () => void;
}

const ImportSlicesContext = createContext<ImportSlicesContextValue | undefined>(
  undefined,
);

export function ImportSlicesProvider({ children }: { children: ReactNode }) {
  const [selectedLocalSlices, setSelectedLocalSlices] = useState<ComponentUI[]>(
    [],
  );
  const [selectedLibrarySlices, setSelectedLibrarySlices] = useState<
    SliceImport[]
  >([]);

  const toggleLocalSlice = useCallback((slice: ComponentUI) => {
    setSelectedLocalSlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) {
        return prev.filter((s) => s.model.id !== slice.model.id);
      }
      return [...prev, slice];
    });
  }, []);

  const toggleLibrarySlice = useCallback((slice: SliceImport) => {
    setSelectedLibrarySlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) {
        return prev.filter((s) => s.model.id !== slice.model.id);
      }
      return [...prev, slice];
    });
  }, []);

  const setAllLibrarySlices = useCallback((slices: SliceImport[]) => {
    setSelectedLibrarySlices(slices);
  }, []);

  const reset = useCallback(() => {
    setSelectedLocalSlices([]);
    setSelectedLibrarySlices([]);
  }, []);

  return (
    <ImportSlicesContext.Provider
      value={{
        selectedLocalSlices,
        selectedLibrarySlices,
        toggleLocalSlice,
        toggleLibrarySlice,
        setAllLibrarySlices,
        reset,
      }}
    >
      {children}
    </ImportSlicesContext.Provider>
  );
}

export function useImportSlicesContext() {
  const context = useContext(ImportSlicesContext);
  if (context === undefined) {
    throw new Error(
      "useImportSlicesContext must be used within ImportSlicesProvider",
    );
  }
  return context;
}
