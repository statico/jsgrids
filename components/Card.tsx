import { AugmentedInfo } from '../lib/libraries'

interface Props {
  info: AugmentedInfo
}

const Card: React.FC<Props> = ({ info }) => (
  <a
    href={info.homeUrl}
    className="bg-white block p-8 shadow-md hover:shadow-lg transition-shadow duration-100 rounded-md text-gray-900 appearance-none"
  >
    <div className="text-2xl text-center font-semibold mb-4">{info.title}</div>
    <div className="">{info.description}</div>
  </a>
)

export default Card
