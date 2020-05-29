import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { GoIssueOpened, GoRepoForked, GoStar } from 'react-icons/go'
import { FEATURES } from '../lib/features'
import { AugmentedInfo } from '../lib/libraries'

const Tidbit: React.FC<{
  icon: React.ReactNode
  value?: any
  title: string
}> = ({ icon, value, title }) => (
  <FeatureText size="big">
    <span
      title={title}
      className={`flex flex-row justify-center items-center ${
        value ? 'text-gray-800' : 'text-gray-500'
      }`}
    >
      {icon}&nbsp;{value || 'n/a'}
    </span>
  </FeatureText>
)

// Sort the features by positive ones first, then middling ones.
const sortedFeatureNames = (features: AugmentedInfo['features']): string[] =>
  Object.keys(features).sort((a, b) => {
    const av = features[a]
    const bv = features[b]
    if (av === true && bv === true) {
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
    } text-gray-800 uppercase leading-tight`}
  >
    {children}
  </span>
)

const FeatureList: React.FC<{ features: AugmentedInfo['features'] }> = ({
  features,
}) => (
  <div className="grid grid-cols-2">
    {sortedFeatureNames(features).map((name) => (
      <FeatureWithIcon name={name} value={features[name]} />
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
          className="flex flex-row items-center mb-1"
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
  } else {
    return null
  }
}

const Card: React.FC<{ info: AugmentedInfo }> = ({ info }) => {
  const gh = info.github
  return (
    <a
      href={info.homeUrl}
      className="bg-white block p-8 shadow-md hover:shadow-lg transition-shadow duration-100 rounded-md text-gray-900 appearance-none"
    >
      <div className="mb-4 text-2xl text-center font-semibold">
        {info.title}
      </div>
      <div className="mb-4">{info.description}</div>
      <div className="mb-4 grid grid-cols-3">
        <Tidbit
          icon={<GoStar />}
          value={gh?.stars}
          title={`${gh?.stars} stars on GitHub`}
        />
        <Tidbit
          icon={<GoRepoForked />}
          value={gh?.forks}
          title={`${gh?.stars} forks on GitHub`}
        />
        <Tidbit
          icon={<GoIssueOpened />}
          value={gh?.openIssues}
          title={`${gh?.stars} open issues on GitHub`}
        />
      </div>
      <FeatureList features={info.features} />
    </a>
  )
}

export default Card
