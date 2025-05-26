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
import { useFilterStore } from "lib/store";
import { ReactNode } from "react";

const ResponsiveText = ({ short, long }: { short: string; long: string }) => (
  <>
    <Text display={["inline", null, null, "none"]}>{short}</Text>
    <Text display={["none", null, null, "inline"]}>{long}</Text>
  </>
);

const FrameworkSelector = (props: BoxProps) => {
  const framework = useFilterStore((state) => state.framework);
  const setFramework = useFilterStore((state) => state.setFramework);
  const handleToggle = (name: FrameworkName) => () => {
    setFramework(framework === name ? null : name);
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
      <HStack spacing={1} alignItems="center">
        <FeaturesSelector />
        <LicenseSelector licenses={new Set(items.map((i: any) => i.license))} />
        <SortSelector />
      </HStack>
      <Text display={["none", null, "inline"]}>{clone.length} results</Text>
    </HStack>
  );

  return <>{children(clone, filterBar)}</>;
};

export default FilterBar;
