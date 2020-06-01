import classNames from 'classnames'
import { DiJqueryLogo } from 'react-icons/di'
import {
  FaAngular,
  FaCheckCircle,
  FaDollarSign,
  FaInfoCircle,
  FaReact,
  FaTimesCircle,
  FaVuejs,
  FaUsers,
} from 'react-icons/fa'
import { GoIssueOpened, GoLaw, GoRepoForked, GoStar } from 'react-icons/go'
import { IoLogoJavascript, IoMdDownload } from 'react-icons/io'
import { FEATURES } from '../lib/features'
import { AugmentedInfo } from '../lib/libraries'

// Sort the features by negative ones first, then positive, then negative.
// Only important negative features are shown, which is why they're first.
const sortedFeatureNames = (features: AugmentedInfo['features']): string[] =>
  Object.keys(features).sort((a, b) => {
    const av = features[a]
    const bv = features[b]
    if (!av) {
      return -1
    } else if (!bv) {
      return 1
    } else if (av === true && bv === true) {
      return a.localeCompare(b)
    } else if (typeof av === 'string' && typeof bv === 'string') {
      return a.localeCompare(b)
    } else if (av === true) {
      return -1
    } else if (bv === true) {
      return 1
    } else {
      return a.localeCompare(b)
    }
  })

const FeatureText: React.FC<{ size?: 'big' | 'small ' }> = ({
  children,
  size = 'small',
}) => (
  <span
    className={`text-${
      size === 'big' ? 'sm' : 'xs'
    } text-gray-800 leading-tight`}
  >
    {children}
  </span>
)

const FeatureList: React.FC<{ features: AugmentedInfo['features'] }> = ({
  features,
}) => (
  <div className="grid grid-cols-2">
    {sortedFeatureNames(features).map((name) => (
      <FeatureWithIcon key={name} name={name} value={features[name]} />
    ))}
  </div>
)

const FeatureWithIcon: React.FC<{
  name: string
  value: boolean | string | null
}> = ({ name, value }) => {
  if (!FEATURES[name]) {
    throw new Error(`Unknown feature name: ${name}`)
  }
  const { title, description } = FEATURES[name]
  if (value) {
    return (
      <FeatureText>
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
      </FeatureText>
    )
  } else if (name === 'maintained' && !value) {
    return (
      <FeatureText>
        <span
          title={typeof value === 'string' ? value : description}
          className="uppercase flex flex-row items-center mb-1"
        >
          <FaTimesCircle className="flex-none w-3 text-red-500" />
          <span className="ml-1">Not Maintained</span>
        </span>
      </FeatureText>
    )
  } else {
    return null
  }
}

const ActionButton: React.FC<{ href: string; title: string }> = ({
  href,
  title,
}) => (
  <a
    href={href}
    className={classNames(
      'block p-2 rounded-md border border-transparent text-center flex justify-center items-center',
      'uppercase text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900',
      'transition transition-all hover:shadow-sm duration-100'
    )}
  >
    {title}
  </a>
)

const Actions: React.FC<{ info: AugmentedInfo }> = ({ info }) => (
  <div className="grid grid-cols-3 gap-4">
    <ActionButton href={info.demoUrl} title="Demo" />
    <ActionButton href={info.github.url} title="Source" />
    <ActionButton href={info.homeUrl} title="Home" />
  </div>
)

const FrameworkInfo = {
  vanilla: {
    title: 'Vanilla JavaScript (no framework)',
    Icon: IoLogoJavascript,
  },
  react: {
    title: 'React',
    Icon: FaReact,
  },
  vue: {
    title: 'Vue.js',
    Icon: FaVuejs,
  },
  angular: {
    title: 'Angular',
    Icon: FaAngular,
  },
  jquery: {
    title: 'jQuery',
    Icon: DiJqueryLogo,
  },
}

const FrameworkList: React.FC<{ info: AugmentedInfo }> = ({ info }) => (
  <div className="flex flex-row items-center justify-center text-2xl">
    {Object.keys(info.frameworks).map((name) => {
      const value = info.frameworks[name]
      const url = typeof value === 'string' ? value : info.homeUrl
      const { title, Icon } = FrameworkInfo[name]
      return (
        <a href={url} key={name}>
          <Icon title={title} />{' '}
        </a>
      )
    })}
  </div>
)

const Tidbit: React.FC<{
  icon: React.ReactNode
  title: string
  value?: any
  url?: string
}> = ({ icon, title, value, url }) => {
  const cn = classNames(
    'flex flex-row justify-center items-center',
    value ? 'text-gray-800' : 'text-gray-500'
  )
  const contents = (
    <>
      {icon}&nbsp;
      {value && typeof value === 'number'
        ? value.toLocaleString()
        : value || 'n/a'}
    </>
  )
  return (
    <FeatureText size="big">
      {value ? (
        <a href={url} title={title} className={cn}>
          {contents}
        </a>
      ) : (
        <span title={title} className={cn}>
          {contents}
        </span>
      )}
    </FeatureText>
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
      <div className="mb-5 grid grid-cols-5">
        <Tidbit
          icon={<GoStar />}
          value={gh?.stars}
          title={`${gh?.stars} stars on GitHub`}
          url={gh?.url}
        />
        <Tidbit
          icon={<IoMdDownload />}
          value={info.npm?.downloads}
          title={`${info.npm?.downloads} downloads on NPM in the last week`}
          url={info.npm?.url}
        />
        <Tidbit
          icon={<GoRepoForked />}
          value={gh?.forks}
          title={`${gh?.stars} forks on GitHub`}
          url={gh?.url}
        />
        <Tidbit
          icon={<FaUsers />}
          value={gh?.contributors}
          title={`${gh?.contributors} contributors on GitHub`}
          url={gh?.url}
        />
        <Tidbit
          icon={<GoIssueOpened />}
          value={gh?.openIssues}
          title={`${gh?.stars} open issues on GitHub`}
          url={gh?.url + '/issues'}
        />
      </div>
      <div className="mb-2">
        <FeatureList features={info.features} />
      </div>
      <div className="mb-5">
        <div className="inline-block">
          <FeatureText size="big">
            <GoLaw className="inline" /> {info.license}
            <br />
            {/* Wishlist: Use a localized currency symbol instead of $ for everyone */}
            <FaDollarSign className="inline" /> {info.revenueModel}
          </FeatureText>
        </div>
      </div>
      <div className="flex-grow"></div>
      <div className="">
        <Actions info={info} />
      </div>
    </div>
  )
}

export default Card
