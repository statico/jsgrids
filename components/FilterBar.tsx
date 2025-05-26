import React from "react";
import MultiItemPicker from "@/components/MultiItemPicker";
import SingleItemPicker from "@/components/SingleItemPicker";
import { FeatureName, FeatureNames, Features } from "@/lib/features";
import {
  FrameworkIcons,
  FrameworkNames,
  FrameworkTitles,
} from "@/lib/frameworks";
import { FrameworkName, LibraryInfo } from "@/lib/libraries";
import { hasAllKeys, SortOptionKey, SortOptions } from "@/lib/sorting";
import { useFilterStore } from "@/lib/store";
import { ReactNode } from "react";

// Simple Tooltip component
const Tooltip = ({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap">
          {title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const ResponsiveText = ({ short, long }: { short: string; long: string }) => (
  <>
    <span className="inline md:hidden">{short}</span>
    <span className="hidden md:inline">{long}</span>
  </>
);

const FrameworkSelector = ({ className = "" }: { className?: string }) => {
  const framework = useFilterStore((state) => state.framework);
  const setFramework = useFilterStore((state) => state.setFramework);
  const handleToggle = (name: FrameworkName) => () => {
    setFramework(framework === name ? null : name);
  };
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <ResponsiveText short="Show:" long="Frameworks:" />
      {FrameworkNames.map((name) => {
        const Icon = FrameworkIcons[name];
        const title = FrameworkTitles[name];
        return (
          <Tooltip title={title} key={name}>
            <button
              className={`p-1 ${
                framework === name ? "bg-gray-500" : "bg-transparent"
              } hover:opacity-75`}
              onClick={handleToggle(name)}
              title={title}
              aria-label={title}
            >
              <Icon style={{ width: 32, height: 32 }} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};

const FeaturesSelector = () => {
  const features = useFilterStore((state) => state.features);
  const setFeatures = useFilterStore((state) => state.setFeatures);
  const handleChange = (newFeatures: Set<FeatureName>) => {
    setFeatures(newFeatures);
  };
  return (
    <MultiItemPicker<FeatureName>
      selected={features}
      onChange={handleChange}
      options={FeatureNames.map((name) => ({
        key: name,
        title: Features[name].title,
        description: Features[name].description,
      }))}
    >
      <ResponsiveText
        short="Features"
        long={features.size ? `${features.size} Features` : "Any Feature"}
      />
    </MultiItemPicker>
  );
};

type LicenseSelectorProps = {
  licenses: Set<string>;
};

const LicenseSelector = ({ licenses }: LicenseSelectorProps) => {
  const license = useFilterStore((state) => state.license);
  const setLicense = useFilterStore((state) => state.setLicense);
  const handleChange = (newLicense: string | null) => {
    setLicense(newLicense);
  };
  return (
    <SingleItemPicker
      selected={license}
      onChange={handleChange}
      options={Array.from(licenses)
        .sort()
        .map((name) => ({
          key: name,
          title: name,
        }))}
    >
      <ResponsiveText short="License" long={license || "Any License"} />
    </SingleItemPicker>
  );
};

const SortSelector = () => {
  const sort = useFilterStore((state) => state.sort);
  const setSort = useFilterStore((state) => state.setSort);
  const handleChange = (newSort: SortOptionKey) => {
    setSort(newSort);
  };
  const selectedOption = SortOptions.find((s) => s.key === sort);
  return (
    <SingleItemPicker
      selected={sort}
      onChange={handleChange}
      options={SortOptions}
      allowNull={false}
    >
      <ResponsiveText short="Sort" long={`Sort by ${selectedOption?.title}`} />
    </SingleItemPicker>
  );
};

type FilterBarProps = {
  items: LibraryInfo[];
  children: (filteredItems: LibraryInfo[], filterBar: ReactNode) => ReactNode;
};

const FilterBar = ({ items, children }: FilterBarProps) => {
  const filters = useFilterStore((state) => ({
    sort: state.sort,
    framework: state.framework,
    features: state.features,
    license: state.license,
  }));

  let clone = items.slice(); // Shallow copy

  const sortOption = SortOptions.find((s) => s.key === filters.sort);
  if (!sortOption) {
    throw new Error(`Unknown sort option ${filters.sort}`);
  }
  clone.sort(sortOption.fn);

  if (filters.framework) {
    clone = clone.filter(
      (item) => filters.framework && item.frameworks[filters.framework],
    );
  }

  if (filters.features.size) {
    clone = clone.filter((item) => hasAllKeys(item.features, filters.features));
  }

  if (filters.license) {
    clone = clone.filter((item) => item.license === filters.license);
  }

  const filterBar = (
    <nav className="flex flex-wrap items-center justify-center space-x-2 m-6 select-none">
      <FrameworkSelector className="mb-2 xl:mb-0" />
      <div className="flex-basis-full w-0 xl:hidden" />
      <div className="flex items-center space-x-1">
        <FeaturesSelector />
        <LicenseSelector licenses={new Set(items.map((i: any) => i.license))} />
        <SortSelector />
      </div>
      <span className="hidden sm:inline">{clone.length} results</span>
    </nav>
  );

  return <>{children(clone, filterBar)}</>;
};

export default FilterBar;
