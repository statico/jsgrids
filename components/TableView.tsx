import React, { memo, JSXElementConstructor } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeatureName, FeatureNames, Features } from "@/lib/features";
import { LibraryInfo } from "@/lib/libraries";
import {
  FaArrowCircleUp,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import { GoIssueOpened, GoPackage, GoRepoForked, GoStar } from "react-icons/go";
import { IoMdDownload } from "react-icons/io";
import { filesize } from "filesize";

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

type FeatureIconProps = {
  name: FeatureName;
  value: boolean | string | null;
  showAbbreviation?: boolean;
};

const FeatureIcon = memo(
  ({ name, value, showAbbreviation = false }: FeatureIconProps) => {
    if (!Features[name]) {
      throw new Error(`Unknown feature name: ${name}`);
    }
    const { title, abbreviation, description, important } = Features[name];

    let icon = null;
    let color = "";
    let tooltipText = "";

    if (value) {
      if (value === true) {
        icon = FaCheckCircle;
        color = "#48bb78";
        tooltipText = description;
      } else if (typeof value === "string" && /premium/i.test(value)) {
        icon = FaArrowCircleUp;
        color = "#4299e1";
        tooltipText = value;
      } else {
        icon = FaInfoCircle;
        color = "#ed8936";
        tooltipText = typeof value === "string" ? value : description;
      }
    } else if (!value && important) {
      icon = FaTimesCircle;
      color = "#f56565";
      tooltipText = description;
    }

    if (!icon) {
      return <div className="w-4 h-4" />;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center cursor-help hover:opacity-75">
            <IconWithColor icon={icon} color={color} />
            {showAbbreviation && (
              <span className="ml-1 text-xs lg:hidden">{abbreviation}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{title}</p>
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);
FeatureIcon.displayName = "FeatureIcon";

type MetricCellProps = {
  value?: any;
  formatter?: (value: any) => string;
  href?: string;
};

const MetricCell = memo(
  ({
    value,
    formatter = (x) => Number(x).toLocaleString(),
    href,
  }: MetricCellProps) => {
    const formattedValue = value === undefined ? "n/a" : formatter(value);
    const contents = (
      <span
        className={`text-sm ${value === undefined ? "text-muted-foreground" : ""}`}
      >
        {formattedValue}
      </span>
    );

    return href && value !== undefined ? (
      <a
        href={href}
        className="hover:underline hover:text-blue-600 dark:hover:text-blue-400"
      >
        {contents}
      </a>
    ) : (
      contents
    );
  },
);
MetricCell.displayName = "MetricCell";

type TableViewProps = {
  items: LibraryInfo[];
};

const TableView = memo(({ items }: TableViewProps) => {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 sticky left-0 bg-background z-10 text-muted-foreground">
              Library
            </TableHead>
            <TableHead className="text-center w-20 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center justify-center">
                    <GoStar className="w-4 h-4 xl:hidden" />
                    <span className="hidden xl:inline">Stars</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub Stars</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="text-center w-20 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center justify-center">
                    <IoMdDownload className="w-4 h-4 xl:hidden" />
                    <span className="hidden xl:inline">Downloads</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>NPM Downloads (weekly)</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="text-center w-20 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center justify-center">
                    <GoPackage className="w-4 h-4 xl:hidden" />
                    <span className="hidden xl:inline">Size</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gzipped Bundle Size</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="text-center w-20 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center justify-center">
                    <GoRepoForked className="w-4 h-4 xl:hidden" />
                    <span className="hidden xl:inline">Forks</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub Forks</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="text-center w-20 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center justify-center">
                    <GoIssueOpened className="w-4 h-4 xl:hidden" />
                    <span className="hidden xl:inline">Issues</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open GitHub Issues</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            {FeatureNames.map((featureName) => (
              <TableHead
                key={featureName}
                className="text-center w-16 text-muted-foreground"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <span className="hidden xl:inline">
                        {Features[featureName].title}
                      </span>
                      <span className="xl:hidden">
                        {Features[featureName].abbreviation}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{Features[featureName].title}</p>
                    <p className="text-sm">
                      {Features[featureName].description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10 text-left">
                <a
                  href={item.homeUrl ?? undefined}
                  className="hover:underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {item.title}
                </a>
              </TableCell>
              <TableCell className="text-right">
                <MetricCell
                  value={item.github?.stars}
                  href={item.github?.url}
                />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell value={item.npm?.downloads} href={item.npm?.url} />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell
                  value={item.bundlephobia?.gzipSize}
                  formatter={(n: number) => (n >= 0 ? filesize(n) : "?? KB")}
                  href={item.bundlephobia?.url}
                />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell
                  value={item.github?.forks}
                  href={item.github?.url}
                />
              </TableCell>
              <TableCell className="text-right">
                <MetricCell
                  value={item.github?.openIssues}
                  href={
                    item.github?.url ? `${item.github.url}/issues` : undefined
                  }
                />
              </TableCell>
              {FeatureNames.map((featureName) => (
                <TableCell key={featureName} className="text-center">
                  <FeatureIcon
                    name={featureName}
                    value={item.features[featureName] ?? null}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
TableView.displayName = "TableView";

export default TableView;
