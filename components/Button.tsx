import { MouseEventHandler } from 'react'
import classnames from 'classnames'

const Button: React.FC<{
  title: string
  className?: string
  href?: string
  small?: boolean
  disabled?: boolean
  onClick?: MouseEventHandler
}> = ({ title, className, href, small, disabled, onClick }) => {
  if (disabled) {
    onClick = (event) => {
      event.preventDefault()
    }
  }
  const cls = classnames(
    'block rounded-md border border-transparent text-center flex justify-center items-center',
    'uppercase transition transition-all duration-100',
    small ? 'text-xs p-1' : 'text-sm p-2',
    disabled
      ? 'bg-gray-100 text-gray-500'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900 hover:shadow-sm cursor-pointer',
    className
  )
  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {title}
    </a>
  ) : (
    <div onClick={onClick} className={cls}>
      {title}
    </div>
  )
}

export default Button
