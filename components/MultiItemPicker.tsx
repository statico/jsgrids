import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState } from 'react'
import { GoChevronDown } from 'react-icons/go'
import Button from './Button'

interface Option {
  key: string
  title: string
  description: string
}

interface Props {
  selected: Set<string>
  options: Option[]
  onChange: (newValue: Set<string>) => void
}

export const MultiItemPicker: React.FC<Props> = ({
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
        <div className="block w-full p-3 text-sm whitespace-no-wrap">
          <div className="mb-3">Choose one or more features:</div>
          <div className="grid grid-cols-2 row-gap-0 col-gap-3 mb-3">
            {options.map(({ key, title, description }) => (
              <label
                key={key}
                title={description}
                className="cursor-pointer hover:bg-gray-100 px-1 py-1"
              >
                <input
                  type="checkbox"
                  className="align-middle mb-1 mr-2"
                  checked={selected.has(key)}
                  onChange={(event) => {
                    const newValue = new Set(selected)
                    if (event.target.checked) {
                      newValue.add(key)
                    } else {
                      newValue.delete(key)
                    }
                    onChange(newValue)
                  }}
                />
                {title}
              </label>
            ))}
          </div>
          <Button
            small
            title="Clear All"
            disabled={selected.size === 0}
            onClick={() => {
              onChange(new Set())
            }}
          />
        </div>
      </div>
    </>
  )
}

export default MultiItemPicker
