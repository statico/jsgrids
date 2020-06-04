const FilterBarButton: React.FC = ({ children }) => (
  <div className="hover:bg-gray-200 rounded-sm outline-none focus:outline-none py-1 px-2 flex flex-row items-center cursor-pointer select-none">
    {children}
  </div>
)

export default FilterBarButton
