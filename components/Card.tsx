import classnames from 'classnames'
import {
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
  FaTimesCircle,
  FaUsers,
} from 'react-icons/fa'
import { GoIssueOpened, GoLaw, GoRepoForked, GoStar } from 'react-icons/go'
import { IoMdDownload } from 'react-icons/io'
import { Features } from '../lib/features'
import { FrameworkIcons, FrameworkTitles } from '../lib/frameworks'
import { AugmentedInfo } from '../lib/libraries'
import { sortedFeatureNames } from '../lib/sorting'
import Button from './Button'
import Tooltip from './Tooltip'
import { format } from 'url'

const FeatureList: React.FC<{ features: AugmentedInfo['features'] }> = ({
  features,
}) => (
  <div className="leading-tight text-xs grid grid-cols-2 row-gap-1 lg:row-gap-0">
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
  const cls = 'uppercase flex flex-row items-center mb-1 hover:opacity-75'
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

const FrameworkList: React.FC<{ info: AugmentedInfo }> = ({ info }) => (
  <div className="flex flex-row items-center justify-center text-2xl">
    {Object.keys(info.frameworks).map((name) => {
      const value = info.frameworks[name]
      const isThirdParty = typeof value === 'string'
      const url = isThirdParty ? value : info.homeUrl
      const title = isThirdParty
        ? `Go to the third-party library for ${FrameworkTitles[name]}`
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
                  'border-2 border-white rounded-full',
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
  href?: string
}> = ({ icon, title, value, href }) => {
  const cls = classnames(
    'flex flex-row justify-center items-center leading-tight text-sm',
    'hover:opacity-75',
    !value && 'text-gray-500'
  )
  const formattedValue =
    value && typeof value === 'number' ? value.toLocaleString() : value || 'n/a'
  const formattedTitle = title.replace('%s', value ? formattedValue : 'unknown')
  const contents = (
    <>
      {icon}&nbsp;{formattedValue}
      {}
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

const Card: React.FC<{ info: AugmentedInfo }> = ({ info }) => {
  const gh = info.github
  return (
    <div
      className={classnames(
        'bg-white block p-4 sm:p-8 shadow-md rounded-md text-gray-900',
        'flex flex-col justify-start'
      )}
    >
      <div className="mb-5 flex flex-row items-center justify-between">
        <div className="text-2xl text-center font-semibold">{info.title}</div>
        <div className="">
          <FrameworkList info={info} />
        </div>
      </div>
      <div className="mb-5">{info.description}</div>
      <div className="mb-5 text-gray-800 flex flex-row justify-between">
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
      <div className="mb-2 text-gray-800">
        <FeatureList features={info.features} />
      </div>
      <div className="mb-5 text-gray-800 text-sm leading-relaxed">
        <div className="inline-block">
          <div className="mb-1 lg:mb-1">
            <GoLaw className="inline" /> {info.license}
          </div>
          <div>
            {/* Wishlist: Use a localized currency symbol instead of $ for everyone */}
            <FaDollarSign className="inline" /> {info.revenueModel}
          </div>
        </div>
      </div>
      <div className="flex-grow">{/* Make buttons appear at bottom */}</div>
      <div className="grid grid-cols-3 col-gap-4">
        <Button href={info.demoUrl} title="Demo" />
        <Button href={info.github?.url} title="Source" />
        <Button href={info.homeUrl} title="Home" />
      </div>
    </div>
  )
}

export default Card
