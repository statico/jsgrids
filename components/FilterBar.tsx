import {
  BoxProps,
  Button,
  chakra,
  HStack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
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
import { atom, useRecoilState, useRecoilValue } from "recoil";

interface FilterState {
  sort: SortOptionKey;
  framework: FrameworkName | null;
  features: Set<FeatureName>;
  license: string | null;
}

const filterState = atom<FilterState>({
  key: "filters",
  default: {
    sort: SortOptions[0].key,
    framework: null,
    features: new Set(),
    license: null,
  },
});

const ResponsiveText = ({ short, long }: { short: string; long: string }) => (
  <>
    <Text display={["inline", null, null, "none"]}>{short}</Text>
    <Text display={["none", null, null, "inline"]}>{long}</Text>
  </>
);

const FrameworkSelector: React.FC<BoxProps> = (props) => {
  const [{ framework }, setFilters] = useRecoilState(filterState);
  const handleToggle = (name: FrameworkName) => () => {
    setFilters((prev) => ({
      ...prev,
      framework: framework === name ? null : name,
    }));
  };
  return (
    <HStack spacing={1} {...props}>
      <ResponsiveText short="Show:" long="Frameworks:" />
      {FrameworkNames.map((name) => {
        const Icon = FrameworkIcons[name];
        const title = FrameworkTitles[name];
        return (
          <Tooltip key={name} title={title}>
            <Button
              p={1}
              onClick={handleToggle(name)}
              background={framework === name ? "gray.500" : "transparent"}
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

const FeaturesSelector: React.FC<{}> = () => {
  const [{ features }, setFilters] = useRecoilState(filterState);
  const handleChange = (newFeatures: Set<FeatureName>) => {
    setFilters((prev) => ({ ...prev, features: newFeatures }));
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

const LicenseSelector: React.FC<{
  licenses: Set<string>;
}> = ({ licenses }) => {
  const [{ license }, setFilters] = useRecoilState(filterState);
  const handleChange = (newLicense: string | null) => {
    setFilters((prev) => ({ ...prev, license: newLicense }));
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

const SortSelector: React.FC<{}> = ({}) => {
  const [{ sort }, setFilters] = useRecoilState(filterState);
  const handleChange = (newSort: SortOptionKey) => {
    setFilters((prev) => ({ ...prev, sort: newSort }));
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

interface FilteredItemsProps {
  items: LibraryInfo[];
  children: (
    filteredItems: LibraryInfo[],
    filterBar: React.ReactNode,
  ) => React.ReactNode;
}

const FilterBar: React.FC<FilteredItemsProps> = ({ items, children }) => {
  const filters = useRecoilValue(filterState);

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
    <HStack
      spacing={2}
      m={6}
      as="nav"
      userSelect="none"
      alignItems="center"
      justifyContent="center"
      flexWrap={["wrap", null, null, null, "nowrap"]}
    >
      <FrameworkSelector mb={[2, null, null, null, 0]} />
      <chakra.div
        flexBasis="100%"
        width={0}
        display={["inherit", null, null, null, "none"]}
      />
      <FeaturesSelector />
      <LicenseSelector licenses={new Set(items.map((i: any) => i.license))} />
      <SortSelector />
      <Text display={["none", null, "inline"]}>{clone.length} results</Text>
    </HStack>
  );

  return <>{children(clone, filterBar)}</>;
};

export default FilterBar;
