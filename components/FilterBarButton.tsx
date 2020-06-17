import classnames from 'classnames'

const FilterBarButton: React.FC = ({ children }) => (
  <div
    className={classnames(
      'hover:bg-gray-400 dark:hover:bg-gray-700',
      'rounded-sm outline-none focus:outline-none py-1 px-2',
      'transition-colors duration-75',
      'flex flex-row items-center cursor-pointer select-none'
    )}
  >
    {children}
  </div>
)

export default FilterBarButton
