import classnames from 'classnames'
import { fileSize } from 'humanize-plus'
import {
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
  FaTimesCircle,
  FaUsers,
} from 'react-icons/fa'
import {
  GoIssueOpened,
  GoLaw,
  GoPackage,
  GoRepoForked,
  GoStar,
} from 'react-icons/go'
import { IoMdDownload } from 'react-icons/io'
import { Features } from '../lib/features'
import { FrameworkIcons, FrameworkTitles } from '../lib/frameworks'
import { LibraryInfo } from '../lib/libraries'
import { sortedFeatureNames } from '../lib/sorting'
import Button from './Button'
import Tooltip from './Tooltip'

const FeatureList: React.FC<{ features: LibraryInfo['features'] }> = ({
  features,
}) => (
  <div className="leading-tight text-xs grid grid-cols-2 gap-y-1 lg:gap-y-0">
    {sortedFeatureNames(features).map((name) => (
      <Feature key={name} name={name} value={features[name]} />
    ))}
  </div>
)

const Feature: React.FC<{
  name: string
  value: boolean | string | null
}> = ({ name, value }) => {
  if (!Features[name]) {
    throw new Error(`Unknown feature name: ${name}`)
  }
  const { title, description, important } = Features[name]
  const cls = classnames(
    'flex flex-row items-center uppercase mb-3/2',
    'hover:opacity-75 transition-opacity duration-75 cursor-default'
  )
  if (value) {
    return (
      <Tooltip tip={typeof value === 'string' ? value : description}>
        <span className={cls}>
          {value === true ? (
            <FaCheckCircle className="flex-none w-3 text-green-400" />
          ) : (
            <FaInfoCircle className="flex-none w-3 text-yellow-500" />
          )}
          <span className="ml-1">{title}</span>
        </span>
      </Tooltip>
    )
  } else if (!value && important) {
    return (
      <Tooltip tip={typeof value === 'string' ? value : description}>
        <span className={cls}>
          <FaTimesCircle className="flex-none w-3 text-red-500" />
          <span className="ml-1">{`Not ${title}`}</span>
        </span>
      </Tooltip>
    )
  } else {
    return null
  }
}

const FrameworkList: React.FC<{ info: LibraryInfo }> = ({ info }) => (
  <div className="flex flex-row items-center justify-center text-2xl">
    {Object.keys(info.frameworks).map((name) => {
      const value = info.frameworks[name]
      const isThirdParty = typeof value === 'string'
      const url = isThirdParty ? value : info.homeUrl
      const title = isThirdParty
        ? `Go to the separate solution for ${FrameworkTitles[name]}`
        : `Built-in support for ${FrameworkTitles[name]}`
      const Icon = FrameworkIcons[name]
      return (
        <Tooltip tip={title} key={name}>
          <a href={url} className="relative inline-block">
            <Icon className="hover:opacity-75" />
            {isThirdParty && (
              <div
                className={classnames(
                  'absolute bottom-0 right-0 w-3 h-3',
                  'border-2 rounded-full border-white dark:border-gray-800',
                  'bg-yellow-500'
                )}
              />
            )}
          </a>
        </Tooltip>
      )
    })}
  </div>
)

const Metric: React.FC<{
  icon: React.ReactNode
  title: string
  value?: any
  formatter?: (value: any) => string
  href?: string
}> = ({
  icon,
  title,
  value,
  formatter = (x) => Number(x).toLocaleString(),
  href,
}) => {
  const cls = classnames(
    'flex flex-row items-center leading-tight text-sm',
    'hover:opacity-75',
    !value && 'text-gray-500'
  )
  const formattedValue = value === undefined ? 'n/a' : formatter(value)
  const formattedTitle = title.replace(
    '%s',
    value === undefined ? 'unknown' : formattedValue
  )
  const contents = (
    <>
      <span className="mr-2">{icon}</span>
      {formattedValue}
    </>
  )
  return value ? (
    <Tooltip tip={formattedTitle}>
      <a href={href} className={cls}>
        {contents}
      </a>
    </Tooltip>
  ) : (
    <Tooltip tip={formattedTitle}>
      <span className={cls}>{contents}</span>
    </Tooltip>
  )
}

const Card: React.FC<{ info: LibraryInfo }> = ({ info }) => {
  const id = `card-${info.id}`
  const gh = info.github
  return (
    <section
      className={classnames(
        'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        'block p-4 sm:p-8 shadow-md rounded-md',
        'flex flex-col justify-start'
      )}
      aria-labelledby={id}
    >
      <div className="mb-4 flex flex-row items-center justify-between">
        <h3 className="text-2xl text-left font-semibold" id={id}>
          {info.title}
        </h3>
        <div>
          <FrameworkList info={info} />
        </div>
      </div>
      <div className="mb-4">{info.description}</div>
      <div className="mb-5 text-gray-800 dark:text-gray-200 grid grid-cols-3 gap-y-2 gap-x-12">
        <Metric
          icon={<GoStar />}
          value={gh?.stars}
          title={'%s stars on GitHub'}
          href={gh?.url}
        />
        <Metric
          icon={<IoMdDownload />}
          value={info.npm?.downloads}
          title={'%s downloads on NPM in the last week'}
          href={info.npm?.url}
        />
        <Metric
          icon={<GoRepoForked />}
          value={gh?.forks}
          title={'%s forks on GitHub'}
          href={gh?.url}
        />
        <Metric
          icon={<GoPackage />}
          value={info.bundlephobia?.gzipSize}
          formatter={fileSize}
          title={'Gzipped package size is %s'}
          href={info.bundlephobia?.url}
        />
        <Metric
          icon={<FaUsers />}
          value={gh?.contributors}
          title={'%s contributors on GitHub'}
          href={gh?.url}
        />
        <Metric
          icon={<GoIssueOpened />}
          value={gh?.openIssues}
          title={'%s open issues on GitHub'}
          href={gh?.url + '/issues'}
        />
      </div>
      <div className="mb-4 text-gray-800 dark:text-gray-200">
        <FeatureList features={info.features} />
      </div>
      <div className="mb-6 text-gray-800 dark:text-gray-200 text-sm grid grid-cols-1 gap-y-1">
        <div className="flex flex-row items-center">
          <GoLaw className="inline mr-2" /> {info.license}
        </div>
        <div className="flex flex-row items-center">
          {/* Wishlist: Use a localized currency symbol instead of $ for everyone */}
          <FaDollarSign className="inline mr-2" /> {info.revenueModel}
        </div>
      </div>
      <div className="flex-grow">{/* Make buttons appear at bottom */}</div>
      <div className="grid grid-cols-3 gap-x-4">
        <Button href={info.demoUrl} title="Demo" />
        <Button href={info.github?.url} title="Source" />
        <Button href={info.homeUrl} title="Home" />
      </div>
    </section>
  )
}

export default Card
