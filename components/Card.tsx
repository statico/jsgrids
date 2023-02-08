import {
  Box,
  Button,
  chakra,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { fileSize } from "humanize-plus";
import { FeatureName, Features } from "lib/features";
import { FrameworkIcons, FrameworkTitles } from "lib/frameworks";
import { FrameworkName, LibraryInfo } from "lib/libraries";
import { sortedFeatureNames } from "lib/sorting";
import { JSXElementConstructor } from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
  FaPlusCircle,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import {
  GoIssueOpened,
  GoLaw,
  GoPackage,
  GoRepoForked,
  GoStar,
} from "react-icons/go";
import { IoMdDownload } from "react-icons/io";

const ColoredIcon = ({
  icon: Icon,
  color,
}: {
  icon: JSXElementConstructor<any>;
  color: string;
}) => (
  <Text color={color}>
    <Icon />
  </Text>
);

const useCardBackgroundColor = () => useColorModeValue("white", "gray.700");

const Feature: React.FC<{
  name: FeatureName;
  value: boolean | string | null;
}> = ({ name, value }) => {
  if (!Features[name]) {
    throw new Error(`Unknown feature name: ${name}`);
  }
  const { title, description, important } = Features[name];
  if (value) {
    return (
      <Tooltip label={typeof value === "string" ? value : description}>
        <HStack spacing={1} cursor="help" _hover={{ opacity: 0.75 }}>
          {value === true ? (
            <ColoredIcon icon={FaCheckCircle} color="green.400" />
          ) : /premium/i.test(value) ? (
            <ColoredIcon icon={FaPlusCircle} color="blue.400" />
          ) : (
            <ColoredIcon icon={FaInfoCircle} color="orange.300" />
          )}
          <Text>{title}</Text>
        </HStack>
      </Tooltip>
    );
  } else if (!value && important) {
    return (
      <Tooltip label={typeof value === "string" ? value : description}>
        <HStack spacing={1} cursor="help" _hover={{ opacity: 0.75 }}>
          <ColoredIcon icon={FaTimesCircle} color="red.500" />
          <Text>{`Not ${title}`}</Text>
        </HStack>
      </Tooltip>
    );
  } else {
    return null;
  }
};

const FrameworkList: React.FC<{ info: LibraryInfo }> = ({ info }) => {
  const bg = useCardBackgroundColor();
  const names = Object.keys(info.frameworks) as FrameworkName[];
  return (
    <HStack fontSize="2xl">
      {names.map((name) => {
        const value = info.frameworks[name];
        const isThirdParty = typeof value === "string";
        const url = isThirdParty ? value : info.homeUrl;
        const title = isThirdParty
          ? `Go to the separate solution for ${FrameworkTitles[name]}`
          : `Built-in support for ${FrameworkTitles[name]}`;
        const Icon = FrameworkIcons[name];
        return (
          <Tooltip label={title} key={name}>
            <Link
              href={url ?? undefined}
              position="relative"
              _hover={{ opacity: 0.75 }}
              title={title}
              aria-label={title}
            >
              <Icon />
              <chakra.div
                position="absolute"
                top={-1}
                right={-1}
                boxSize={3}
                border={`2px solid`}
                borderColor={bg}
                bg={isThirdParty ? "yellow.500" : "green.400"}
                borderRadius={999}
              />
            </Link>
          </Tooltip>
        );
      })}
    </HStack>
  );
};

const Metric: React.FC<{
  icon: React.ReactNode;
  title: string;
  value?: any;
  formatter?: (value: any) => string;
  href?: string;
}> = ({
  icon,
  title,
  value,
  formatter = (x) => Number(x).toLocaleString(),
  href,
}) => {
  const formattedValue = value === undefined ? "n/a" : formatter(value);
  const formattedTitle = title.replace(
    "%s",
    value === undefined ? "unknown" : formattedValue
  );
  const contents = (
    <HStack cursor="pointer" _hover={{ opacity: 0.75 }}>
      <Text>{icon}</Text>
      <Text>{formattedValue}</Text>
    </HStack>
  );
  return value ? (
    <Tooltip label={formattedTitle}>
      <Link href={href}>{contents}</Link>
    </Tooltip>
  ) : (
    <Tooltip label={formattedTitle}>{contents}</Tooltip>
  );
};

const Card: React.FC<{ info: LibraryInfo }> = ({ info }) => {
  const bg = useCardBackgroundColor();
  const id = `card-${info.id}`;
  const gh = info.github;
  return (
    <Stack
      as="section"
      bg={bg}
      shadow="lg"
      borderRadius="md"
      p={8}
      spacing={4}
      aria-labelledby={id}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Heading
          size="lg"
          as="a"
          href={info.homeUrl ?? undefined}
          fontWeight="semibold"
          id={id}
        >
          {info.title}
        </Heading>
        <FrameworkList info={info} />
      </Flex>

      <Text>{info.description}</Text>

      <SimpleGrid columns={3} spacingX={12} spacingY={1} fontSize="sm">
        <Metric
          icon={<GoStar />}
          value={gh?.stars}
          title={"%s stars on GitHub"}
          href={gh?.url}
        />
        <Metric
          icon={<IoMdDownload />}
          value={info.npm?.downloads}
          title={"%s downloads on NPM in the last week"}
          href={info.npm?.url}
        />
        <Metric
          icon={<GoRepoForked />}
          value={gh?.forks}
          title={"%s forks on GitHub"}
          href={gh?.url}
        />
        <Metric
          icon={<GoPackage />}
          value={info.bundlephobia?.gzipSize}
          formatter={fileSize}
          title={"Gzipped package size is %s"}
          href={info.bundlephobia?.url}
        />
        <Metric
          icon={<FaUsers />}
          value={gh?.contributors}
          title={"%s contributors on GitHub"}
          href={gh?.url}
        />
        <Metric
          icon={<GoIssueOpened />}
          value={gh?.openIssues}
          title={"%s open issues on GitHub"}
          href={gh?.url + "/issues"}
        />
      </SimpleGrid>

      <SimpleGrid
        columns={2}
        spacingX={4}
        fontSize="xs"
        textTransform="uppercase"
      >
        {sortedFeatureNames(info.features).map((name) => (
          <Feature key={name} name={name} value={info.features[name]} />
        ))}
      </SimpleGrid>

      <Box fontSize="sm">
        <HStack spacing={2}>
          <GoLaw />
          <Text>{info.license}</Text>
        </HStack>
        <HStack spacing={2}>
          <FaDollarSign />
          <Text>{info.revenueModel}</Text>
        </HStack>
      </Box>

      <Flex flexGrow={1} flexDir="column" justifyContent="end">
        <HStack justifyContent="space-between" spacing={6}>
          {info.demoUrl && (
            <Button as="a" href={info.demoUrl} flex={1}>
              Demo
            </Button>
          )}
          {info.github?.url && (
            <Button as="a" href={info.github?.url} flex={1}>
              Source
            </Button>
          )}
          {info.homeUrl && (
            <Button as="a" href={info.homeUrl} flex={1}>
              Home
            </Button>
          )}
        </HStack>
      </Flex>
    </Stack>
  );
};

export default Card;
