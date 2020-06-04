import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState, ReactNode } from 'react'
import { GoChevronDown } from 'react-icons/go'

interface Props {
  value: string
  items: [string, ReactNode][]
  onChange: (newValue: string) => void
}

export const SingleItemMenu: React.FC<Props> = ({
  children,
  value,
  items,
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
          'bg-white z-50 float-left rounded-sm shadow-md text-left mt-1 border-gray-200 border'
        )}
        style={{ minWidth: '12rem' }}
        onMouseEnter={handleEnterPopup}
        onMouseLeave={handleLeavePopup}
      >
        {items.map(([newValue, contents]) => (
          <div
            key={newValue}
            className="block w-full px-4 py-3 text-sm whitespace-no-wrap bg-transparent hover:bg-gray-200 cursor-pointer select-none"
            onClick={() => {
              onChange(newValue)
              setIsOverPopup(false)
            }}
          >
            {contents}
          </div>
        ))}
      </div>
    </>
  )
}

export default SingleItemMenu
