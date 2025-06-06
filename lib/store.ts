import { create } from "zustand";
import { FeatureName } from "./features";
import { FrameworkName } from "./libraries";
import { SortOptionKey, SortOptions } from "./sorting";

type FilterState = {
  sort: SortOptionKey;
  framework: FrameworkName | null;
  features: Set<FeatureName>;
  license: string | null;
  viewMode: "cards" | "table";
};

type FilterActions = {
  setSort: (sort: SortOptionKey) => void;
  setFramework: (framework: FrameworkName | null) => void;
  setFeatures: (features: Set<FeatureName>) => void;
  setLicense: (license: string | null) => void;
  setViewMode: (viewMode: "cards" | "table") => void;
  updateFilters: (updater: (prev: FilterState) => FilterState) => void;
};

type FilterStore = FilterState & FilterActions;

export const useFilterStore = create<FilterStore>((set) => ({
  // Initial state
  sort: SortOptions[0].key,
  framework: null,
  features: new Set(),
  license: null,
  viewMode: "cards",

  // Actions
  setSort: (sort) => set({ sort }),
  setFramework: (framework) => set({ framework }),
  setFeatures: (features) => set({ features }),
  setLicense: (license) => set({ license }),
  setViewMode: (viewMode) => set({ viewMode }),
  updateFilters: (updater) =>
    set((state) => {
      const {
        setSort,
        setFramework,
        setFeatures,
        setLicense,
        setViewMode,
        updateFilters,
        ...currentState
      } = state;
      return updater(currentState);
    }),
}));
