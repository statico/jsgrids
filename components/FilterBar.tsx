import React from "react";
import { useEffect, useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoChevronDown } from "react-icons/go";

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
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <Button
                variant={framework === name ? "default" : "ghost"}
                size="icon"
                onClick={handleToggle(name)}
                title={title}
                aria-label={title}
                className="p-1 w-10 h-10"
              >
                <Icon style={{ width: 32, height: 32 }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
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

const FilterBarContent = ({ items, children }: FilterBarProps) => {
  // Use individual selectors instead of creating a new object
  const sort = useFilterStore((state) => state.sort);
  const framework = useFilterStore((state) => state.framework);
  const features = useFilterStore((state) => state.features);
  const license = useFilterStore((state) => state.license);

  const filteredItems = useMemo(() => {
    let clone = items.slice(); // Shallow copy

    const sortOption = SortOptions.find((s) => s.key === sort);
    if (!sortOption) {
      throw new Error(`Unknown sort option ${sort}`);
    }
    clone.sort(sortOption.fn);

    if (framework) {
      clone = clone.filter((item) => framework && item.frameworks[framework]);
    }

    if (features.size) {
      clone = clone.filter((item) => hasAllKeys(item.features, features));
    }

    if (license) {
      clone = clone.filter((item) => item.license === license);
    }

    return clone;
  }, [items, sort, framework, features, license]);

  const filterBar = (
    <nav className="flex flex-wrap items-center justify-center space-x-2 m-6 select-none">
      <FrameworkSelector className="mb-2 xl:mb-0" />
      <div className="flex-basis-full w-0 xl:hidden" />
      <div className="flex items-center space-x-1">
        <FeaturesSelector />
        <LicenseSelector licenses={new Set(items.map((i: any) => i.license))} />
        <SortSelector />
      </div>
      <span className="hidden sm:inline">{filteredItems.length} results</span>
    </nav>
  );

  return children(filteredItems, filterBar);
};

const FilterBar = ({ items, children }: FilterBarProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and before hydration, show all items with a simple filter bar
  if (!isClient) {
    // Apply default sorting during SSR to prevent unsorted cards
    const sortedItems = items.slice().sort(SortOptions[0].fn);

    const defaultFilterBar = (
      <nav className="flex flex-wrap items-center justify-center space-x-2 m-6 select-none">
        <div className="flex items-center space-x-1 mb-2 xl:mb-0">
          <ResponsiveText short="Show:" long="Frameworks:" />
          {FrameworkNames.map((name) => {
            const Icon = FrameworkIcons[name];
            const title = FrameworkTitles[name];
            return (
              <Button
                key={name}
                variant="ghost"
                size="icon"
                className="p-1 w-10 h-10"
                title={title}
                aria-label={title}
                disabled
              >
                <Icon style={{ width: 32, height: 32 }} />
              </Button>
            );
          })}
        </div>
        <div className="flex-basis-full w-0 xl:hidden" />
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="flex items-center space-x-2 font-normal"
            disabled
          >
            <span>
              <ResponsiveText short="Features" long="Any Feature" />
            </span>
            <GoChevronDown />
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2 font-normal"
            disabled
          >
            <span>
              <ResponsiveText short="License" long="Any License" />
            </span>
            <GoChevronDown />
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2 font-normal"
            disabled
          >
            <span>
              <ResponsiveText
                short="Sort"
                long={`Sort by ${SortOptions[0].title}`}
              />
            </span>
            <GoChevronDown />
          </Button>
        </div>
        <span className="hidden sm:inline">{sortedItems.length} results</span>
      </nav>
    );

    return <>{children(sortedItems, defaultFilterBar)}</>;
  }

  return <FilterBarContent items={items} children={children} />;
};

export default FilterBar;
