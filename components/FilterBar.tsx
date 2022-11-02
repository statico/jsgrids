import { Button, chakra, HStack, Text, Tooltip } from "@chakra-ui/react";
import MultiItemPicker from "components/MultiItemPicker";
import SingleItemPicker from "components/SingleItemPicker";
import { FeatureName, FeatureNames, Features } from "lib/features";
import {
  FrameworkIcons,
  FrameworkNames,
  FrameworkTitles,
} from "lib/frameworks";
import { FrameworkName, LibraryInfo } from "lib/libraries";
import { hasAllKeys, SortOptionKey, SortOptions } from "lib/sorting";
import { useState } from "react";

interface FilterState {
  sort: SortOptionKey;
  framework: FrameworkName | null;
  features: Set<FeatureName>;
  license: string | null;
}

const ResponsiveText = ({ short, long }: { short: string; long: string }) => (
  <>
    <Text display={["inline", null, null, "none"]}>{short}</Text>
    <Text display={["none", null, null, "inline"]}>{long}</Text>
  </>
);

const FrameworkSelector: React.FC<{
  selected: FrameworkName | null;
  onChange: (newSelected: FrameworkName | null) => void;
}> = ({ selected, onChange }) => {
  const handleToggle = (name: FrameworkName) => () => {
    onChange(selected === name ? null : name);
  };
  return (
    <HStack spacing={1}>
      <ResponsiveText short="Show:" long="Frameworks:" />
      {FrameworkNames.map((name) => {
        const Icon = FrameworkIcons[name];
        const title = FrameworkTitles[name];
        return (
          <Tooltip key={name} title={title}>
            <Button
              p={1}
              onClick={handleToggle(name)}
              background={selected === name ? "gray.500" : "transparent"}
              title={title}
              aria-label={title}
            >
              <Icon style={{ width: 32, height: 32 }} />
            </Button>
          </Tooltip>
        );
      })}
    </HStack>
  );
};

const FeaturesSelector: React.FC<{
  selected: Set<FeatureName>;
  onChange: (newSelected: Set<FeatureName>) => void;
}> = ({ selected, onChange }) => {
  return (
    <MultiItemPicker
      selected={selected}
      onChange={onChange}
      options={FeatureNames.map((name) => ({
        key: name,
        title: Features[name].title,
        description: Features[name].description,
      }))}
    >
      <ResponsiveText
        short="Features"
        long={selected.size ? `${selected.size} Features` : "Any Feature"}
      />
    </MultiItemPicker>
  );
};

const LicenseSelector: React.FC<{
  licenses: Set<string>;
  selected: string | null;
  onChange: (newSelected: string) => void;
}> = ({ licenses, selected, onChange }) => {
  return (
    <SingleItemPicker
      selected={selected}
      onChange={onChange}
      options={Array.from(licenses)
        .sort()
        .map((name) => ({
          key: name,
          title: name,
        }))}
    >
      <ResponsiveText short="License" long={selected || "Any License"} />
    </SingleItemPicker>
  );
};

const SortSelector: React.FC<{
  selected: SortOptionKey;
  onChange: (newSelected: SortOptionKey) => void;
}> = ({ selected, onChange }) => {
  const selectedOption = SortOptions.find((s) => s.key === selected);
  return (
    <SingleItemPicker
      selected={selected}
      onChange={onChange}
      options={SortOptions}
      allowNull={false}
    >
      <ResponsiveText short="Sort" long={`Sort by ${selectedOption?.title}`} />
    </SingleItemPicker>
  );
};

interface FilteredItemsProps {
  items: LibraryInfo[];
  children: (
    filteredItems: LibraryInfo[],
    filterBar: React.ReactNode
  ) => React.ReactNode;
}

const FilterBar: React.FC<FilteredItemsProps> = ({ items, children }) => {
  const [filters, setFilters] = useState<FilterState>({
    sort: SortOptions[0].key,
    framework: null,
    features: new Set(),
    license: null,
  });

  let clone = items.slice(); // Shallow copy

  const sortOption = SortOptions.find((s) => s.key === filters.sort);
  if (!sortOption) {
    throw new Error(`Unknown sort option ${filters.sort}`);
  }
  clone.sort(sortOption.fn);

  if (filters.framework) {
    clone = clone.filter(
      (item) => filters.framework && item.frameworks[filters.framework]
    );
  }
  if (filters.features.size) {
    clone = clone.filter((item) => hasAllKeys(item.features, filters.features));
  }
  if (filters.license) {
    clone = clone.filter((item) => item.license === filters.license);
  }

  const filterBar = (
    <HStack
      spacing={2}
      m={6}
      as="nav"
      userSelect="none"
      alignItems="center"
      justifyContent="center"
      flexWrap={["wrap", null, null, null, "nowrap"]}
    >
      <FrameworkSelector
        selected={filters.framework}
        onChange={(framework) => {
          setFilters({ ...filters, framework });
        }}
      />
      <chakra.div
        flexBasis="100%"
        width={0}
        display={["inherit", null, null, null, "none"]}
      />
      <FeaturesSelector
        selected={filters.features}
        onChange={(features) => {
          setFilters({ ...filters, features });
        }}
      />
      <LicenseSelector
        licenses={new Set<string>(items.map((i: any) => i.license))}
        selected={filters.license}
        onChange={(license) => {
          setFilters({ ...filters, license });
        }}
      />
      <SortSelector
        selected={filters.sort}
        onChange={(sort) => {
          setFilters({ ...filters, sort });
        }}
      />
      <Text display={["none", null, "inline"]}>{clone.length} results</Text>
    </HStack>
  );

  return <>{children(clone, filterBar)}</>;
};

export default FilterBar;
