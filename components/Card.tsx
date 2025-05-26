import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeatureName, Features } from "@/lib/features";
import { FrameworkIcons, FrameworkTitles } from "@/lib/frameworks";
import { FrameworkName, LibraryInfo } from "@/lib/libraries";
import { sortedFeatureNames } from "@/lib/sorting";
import { filesize } from "filesize";
import { memo, JSXElementConstructor, ReactNode } from "react";
import {
  FaArrowCircleUp,
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
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

const IconWithColor = memo(
  ({
    icon: Icon,
    color,
  }: {
    icon: JSXElementConstructor<any>;
    color: string;
  }) => (
    <span style={{ color }}>
      <Icon />
    </span>
  ),
);
IconWithColor.displayName = "IconWithColor";

type FeatureProps = {
  name: FeatureName;
  value: boolean | string | null;
};

const Feature = memo(({ name, value }: FeatureProps) => {
  if (!Features[name]) {
    throw new Error(`Unknown feature name: ${name}`);
  }
  const { title, description, important } = Features[name];
  if (value) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1.5 cursor-help hover:opacity-75">
            {value === true ? (
              <IconWithColor icon={FaCheckCircle} color="#48bb78" />
            ) : /premium/i.test(value) ? (
              <IconWithColor icon={FaArrowCircleUp} color="#4299e1" />
            ) : (
              <IconWithColor icon={FaInfoCircle} color="#ed8936" />
            )}
            <span className="text-xs">{title}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{typeof value === "string" ? value : description}</p>
        </TooltipContent>
      </Tooltip>
    );
  } else if (!value && important) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1.5 cursor-help hover:opacity-75">
            <IconWithColor icon={FaTimesCircle} color="#f56565" />
            <span className="text-xs">{`Not ${title}`}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{typeof value === "string" ? value : description}</p>
        </TooltipContent>
      </Tooltip>
    );
  } else {
    return null;
  }
});
Feature.displayName = "Feature";

type FrameworkListProps = {
  info: LibraryInfo;
};

const FrameworkList = memo(({ info }: FrameworkListProps) => {
  const names = Object.keys(info.frameworks) as FrameworkName[];
  return (
    <div className="flex space-x-2 text-2xl">
      {names.map((name) => {
        const value = info.frameworks[name];
        const isThirdParty = typeof value === "string";
        const url = isThirdParty ? value : info.homeUrl;
        const title = isThirdParty
          ? `Go to the separate solution for ${FrameworkTitles[name]}`
          : `Built-in support for ${FrameworkTitles[name]}`;
        const Icon = FrameworkIcons[name];
        return (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <a
                href={url ?? undefined}
                className="relative hover:opacity-75"
                title={title}
                aria-label={title}
              >
                <Icon />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-white dark:border-gray-700 rounded-full ${
                    isThirdParty ? "bg-yellow-500" : "bg-green-400"
                  }`}
                />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
});
FrameworkList.displayName = "FrameworkList";

type MetricProps = {
  icon: ReactNode;
  title: string;
  value?: any;
  formatter?: (value: any) => string;
  href?: string;
};

const Metric = memo(
  ({
    icon,
    title,
    value,
    formatter = (x) => Number(x).toLocaleString(),
    href,
  }: MetricProps) => {
    const formattedValue = value === undefined ? "n/a" : formatter(value);
    const formattedTitle = title.replace(
      "%s",
      value === undefined ? "unknown" : formattedValue,
    );
    const contents = (
      <div className="flex items-center space-x-1 cursor-pointer hover:opacity-75">
        <span>{icon}</span>
        <span>{formattedValue}</span>
      </div>
    );
    return value ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={href}>{contents}</a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formattedTitle}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>{contents}</TooltipTrigger>
        <TooltipContent>
          <p>{formattedTitle}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);
Metric.displayName = "Metric";

type CardProps = {
  info: LibraryInfo;
};

const Card = memo(({ info }: CardProps) => {
  const id = `card-${info.id}`;
  const gh = info.github;
  return (
    <ShadcnCard className="flex flex-col h-full gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <a
              href={info.homeUrl ?? undefined}
              id={id}
              className="hover:underline"
            >
              {info.title}
            </a>
          </CardTitle>
          <FrameworkList info={info} />
        </div>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-3 gap-x-12 gap-y-1 text-sm">
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
            formatter={(n: number) => (n >= 0 ? filesize(n) : "?? KB")}
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
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs uppercase">
          {sortedFeatureNames(info.features).map((name) => (
            <Feature key={name} name={name} value={info.features[name]} />
          ))}
        </div>

        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <GoLaw />
            <span>{info.license}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaDollarSign />
            <span>{info.revenueModel}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex justify-between space-x-6 w-full">
          {info.demoUrl && (
            <Button asChild variant="outline" className="flex-1">
              <a href={info.demoUrl}>Demo</a>
            </Button>
          )}
          {info.github?.url && (
            <Button asChild variant="outline" className="flex-1">
              <a href={info.github?.url}>Source</a>
            </Button>
          )}
          {info.homeUrl && (
            <Button asChild variant="outline" className="flex-1">
              <a href={info.homeUrl}>Home</a>
            </Button>
          )}
        </div>
      </CardFooter>
    </ShadcnCard>
  );
});
Card.displayName = "Card";

export default Card;
