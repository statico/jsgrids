import React, { useState } from "react";
import { filesize } from "filesize";
import { FeatureName, Features } from "@/lib/features";
import { FrameworkIcons, FrameworkTitles } from "@/lib/frameworks";
import { FrameworkName, LibraryInfo } from "@/lib/libraries";
import { sortedFeatureNames } from "@/lib/sorting";
import { JSXElementConstructor } from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
  FaArrowCircleUp,
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

const IconWithColor = ({
  icon: Icon,
  color,
}: {
  icon: JSXElementConstructor<any>;
  color: string;
}) => (
  <span style={{ color }}>
    <Icon />
  </span>
);

// Simple Tooltip component
const Tooltip = ({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap">
          {label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

type FeatureProps = {
  name: FeatureName;
  value: boolean | string | null;
};

const Feature = ({ name, value }: FeatureProps) => {
  if (!Features[name]) {
    throw new Error(`Unknown feature name: ${name}`);
  }
  const { title, description, important } = Features[name];
  if (value) {
    return (
      <Tooltip label={typeof value === "string" ? value : description}>
        <div className="flex items-center space-x-1 cursor-help hover:opacity-75">
          {value === true ? (
            <IconWithColor icon={FaCheckCircle} color="#48bb78" />
          ) : /premium/i.test(value) ? (
            <IconWithColor icon={FaArrowCircleUp} color="#4299e1" />
          ) : (
            <IconWithColor icon={FaInfoCircle} color="#ed8936" />
          )}
          <span className="text-sm">{title}</span>
        </div>
      </Tooltip>
    );
  } else if (!value && important) {
    return (
      <Tooltip label={typeof value === "string" ? value : description}>
        <div className="flex items-center space-x-1 cursor-help hover:opacity-75">
          <IconWithColor icon={FaTimesCircle} color="#f56565" />
          <span className="text-sm">{`Not ${title}`}</span>
        </div>
      </Tooltip>
    );
  } else {
    return null;
  }
};

type FrameworkListProps = {
  info: LibraryInfo;
};

const FrameworkList = ({ info }: FrameworkListProps) => {
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
          <Tooltip label={title} key={name}>
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
          </Tooltip>
        );
      })}
    </div>
  );
};

type MetricProps = {
  icon: React.ReactNode;
  title: string;
  value?: any;
  formatter?: (value: any) => string;
  href?: string;
};

const Metric = ({
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
    <Tooltip label={formattedTitle}>
      <a href={href}>{contents}</a>
    </Tooltip>
  ) : (
    <Tooltip label={formattedTitle}>{contents}</Tooltip>
  );
};

type CardProps = {
  info: LibraryInfo;
};

const Card = ({ info }: CardProps) => {
  const id = `card-${info.id}`;
  const gh = info.github;
  return (
    <section
      className="bg-white dark:bg-gray-700 shadow-lg rounded-md p-8 space-y-4 flex flex-col"
      aria-labelledby={id}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          <a
            href={info.homeUrl ?? undefined}
            id={id}
            className="hover:underline"
          >
            {info.title}
          </a>
        </h3>
        <FrameworkList info={info} />
      </div>

      <p className="text-gray-700 dark:text-gray-300">{info.description}</p>

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

      <div className="grid grid-cols-2 gap-x-4 text-xs uppercase">
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

      <div className="flex-grow flex flex-col justify-end">
        <div className="flex justify-between space-x-6">
          {info.demoUrl && (
            <a
              href={info.demoUrl}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
            >
              Demo
            </a>
          )}
          {info.github?.url && (
            <a
              href={info.github?.url}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
            >
              Source
            </a>
          )}
          {info.homeUrl && (
            <a
              href={info.homeUrl}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
            >
              Home
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Card;
