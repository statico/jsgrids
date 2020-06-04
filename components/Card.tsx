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

const FeatureList: React.FC<{ features: AugmentedInfo['features'] }> = ({
  features,
}) => (
  <div className="leading-tight text-xs grid grid-cols-2">
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
  if (value) {
    return (
      <span
        title={typeof value === 'string' ? value : description}
        className="uppercase flex flex-row items-center mb-1"
      >
        {value === true ? (
          <FaCheckCircle className="flex-none w-3 text-green-400" />
        ) : (
          <FaInfoCircle className="flex-none w-3 text-yellow-500" />
        )}
        <span className="ml-1">{title}</span>
      </span>
    )
  } else if (!value && important) {
    return (
      <span
        title={typeof value === 'string' ? value : description}
        className="uppercase flex flex-row items-center mb-1"
      >
        <FaTimesCircle className="flex-none w-3 text-red-500" />
        <span className="ml-1">{`Not ${title}`}</span>
      </span>
    )
  } else {
    return null
  }
}

const FrameworkList: React.FC<{ info: AugmentedInfo }> = ({ info }) => (
  <div className="flex flex-row items-center justify-center text-2xl">
    {Object.keys(info.frameworks).map((name) => {
      const value = info.frameworks[name]
      const url = typeof value === 'string' ? value : info.homeUrl
      const title = FrameworkTitles[name]
      const Icon = FrameworkIcons[name]
      return (
        <a href={url} key={name}>
          <Icon title={title} />{' '}
        </a>
      )
    })}
  </div>
)

const Metric: React.FC<{
  icon: React.ReactNode
  title: string
  value?: any
  url?: string
}> = ({ icon, title, value, url }) => {
  const cls = classnames(
    'flex flex-row justify-center items-center leading-tight text-sm',
    !value && 'text-gray-500'
  )
  const contents = (
    <>
      {icon}&nbsp;
      {value && typeof value === 'number'
        ? value.toLocaleString()
        : value || 'n/a'}
    </>
  )
  return value ? (
    <a href={url} title={title} className={cls}>
      {contents}
    </a>
  ) : (
    <span title={title} className={cls}>
      {contents}
    </span>
  )
}

const Card: React.FC<{ info: AugmentedInfo }> = ({ info }) => {
  const gh = info.github
  return (
    <div className="bg-white block p-8 shadow-md rounded-md text-gray-900 flex flex-col justify-start">
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
          title={`${gh?.stars} stars on GitHub`}
          url={gh?.url}
        />
        <Metric
          icon={<IoMdDownload />}
          value={info.npm?.downloads}
          title={`${info.npm?.downloads} downloads on NPM in the last week`}
          url={info.npm?.url}
        />
        <Metric
          icon={<GoRepoForked />}
          value={gh?.forks}
          title={`${gh?.stars} forks on GitHub`}
          url={gh?.url}
        />
        <Metric
          icon={<FaUsers />}
          value={gh?.contributors}
          title={`${gh?.contributors} contributors on GitHub`}
          url={gh?.url}
        />
        <Metric
          icon={<GoIssueOpened />}
          value={gh?.openIssues}
          title={`${gh?.stars} open issues on GitHub`}
          url={gh?.url + '/issues'}
        />
      </div>
      <div className="mb-2 text-gray-800">
        <FeatureList features={info.features} />
      </div>
      <div className="mb-5 text-gray-800 text-sm leading-relaxed">
        <div className="inline-block">
          <GoLaw className="inline" /> {info.license}
          <br />
          {/* Wishlist: Use a localized currency symbol instead of $ for everyone */}
          <FaDollarSign className="inline" /> {info.revenueModel}
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
