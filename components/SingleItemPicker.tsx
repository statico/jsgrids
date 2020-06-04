import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState } from 'react'
import { GoChevronDown } from 'react-icons/go'

interface Option {
  key: string
  title: string
  description: string
}

interface Props {
  selected: string | null
  options: Option[]
  onChange: (newValue: string) => void
}

export const SingleItemPicker: React.FC<Props> = ({
  children,
  selected,
  options,
  onChange,
}) => {
  const [isOverButton, setIsOverButton] = useState(false)
  const [isOverPopup, setIsOverPopup] = useState(false)

  const buttonRef = createRef<HTMLButtonElement>()
  const popupRef = createRef<HTMLDivElement>()

  const handleEnterButton = () => {
    if (!buttonRef.current || !popupRef.current) {
      return
    }
    setIsOverButton(true)
    createPopper(buttonRef.current, popupRef.current, {
      placement: 'bottom-start',
    })
  }
  const handleLeaveButton = useCallback(() => {
    setIsOverButton(false)
  }, [])
  const handleEnterPopup = useCallback(() => {
    setIsOverPopup(true)
  }, [])
  const handleLeavePopup = useCallback(() => {
    setIsOverPopup(false)
  }, [])

  return (
    <>
      <button
        className="hover:bg-gray-200 rounded-sm outline-none focus:outline-none py-1 px-2 flex flex-row items-center cursor-pointer select-none"
        type="button"
        ref={buttonRef}
        onMouseEnter={handleEnterButton}
        onMouseLeave={handleLeaveButton}
      >
        {children}
        <GoChevronDown className="ml-1" />
      </button>
      <div
        ref={popupRef}
        className={classnames(
          isOverButton || isOverPopup ? 'block' : 'hidden',
          'bg-white z-50 float-left rounded-sm shadow-md text-left mt-1 border-gray-200 border select-none'
        )}
        style={{ minWidth: '12rem' }}
        onMouseEnter={handleEnterPopup}
        onMouseLeave={handleLeavePopup}
      >
        <div className="block w-full px-4 py-3 text-sm whitespace-no-wrap">
          <div
            className={classnames(
              'block p-2 rounded-md border border-transparent text-center flex justify-center items-center',
              'uppercase text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900',
              'transition transition-all hover:shadow-sm duration-100'
            )}
            onClick={() => {
              onChange(null)
            }}
          >
            Clear All
          </div>
          <div className="grid grid-cols-2">
            {options.map(({ key, title, description }) => (
              <label key={key} title={description} className="cursor-pointer">
                <input
                  type="radio"
                  checked={selected === key}
                  onChange={(event) => {
                    onChange(key)
                  }}
                />{' '}
                {title}
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default SingleItemPicker
