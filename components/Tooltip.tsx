import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState } from 'react'

const Tooltip: React.FC<{ tip: string }> = ({ tip, children }) => {
  const [isOverButton, setIsOverButton] = useState(false)
  const [isOverPopup, setIsOverPopup] = useState(false)

  const buttonRef = createRef<HTMLDivElement>()
  const popupRef = createRef<HTMLDivElement>()

  const handleEnterButton = () => {
    if (!buttonRef.current || !popupRef.current) {
      return
    }
    setIsOverButton(true)
    createPopper(buttonRef.current, popupRef.current, {
      placement: 'bottom',
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
      <div
        className="inline-block"
        ref={buttonRef}
        onMouseEnter={handleEnterButton}
        onMouseLeave={handleLeaveButton}
      >
        {children}
      </div>
      <div
        className={classnames(
          'pt-1',
          isOverButton || isOverPopup ? 'block' : 'hidden'
        )}
        ref={popupRef}
      >
        <div
          className={classnames(
            'z-50 rounded-sm shadow-md text-left py-1 px-2 select-none',
            'bg-yellow-200 text-gray-900 text-xs text-left max-w-sm whitespace-normal'
          )}
          onMouseEnter={handleEnterPopup}
          onMouseLeave={handleLeavePopup}
        >
          {tip}
        </div>
      </div>
    </>
  )
}

export default Tooltip
