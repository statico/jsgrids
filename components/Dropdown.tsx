import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useCallback, useState, useEffect } from 'react'

export const Dropdown: React.FC<{
  button: React.ReactNode
}> = ({ button, children }) => {
  const [isOverButton, setIsOverButton] = useState(false)
  const [isOverPopup, setIsOverPopup] = useState(false)
  const [isLockedOpen, setIsLockedOpen] = useState(false)

  const buttonRef = createRef<HTMLDivElement>()
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

  const handleButtonClick = useCallback(() => {
    setIsLockedOpen(true)
  }, [])
  const handleDocumentClick = useCallback(() => {
    setIsLockedOpen(false)
  }, [])
  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick)
    return () => {
      document.body.removeEventListener('click', handleDocumentClick)
    }
  })

  const isOpen = isOverButton || isOverPopup || isLockedOpen

  return (
    <>
      <div
        className="inline-block active:opacity-75"
        ref={buttonRef}
        onMouseEnter={handleEnterButton}
        onMouseLeave={handleLeaveButton}
        onClick={handleButtonClick}
      >
        {button}
      </div>
      <div
        ref={popupRef}
        className={classnames(
          'bg-white z-30 float-left rounded-sm shadow-lg text-left mt-1',
          'border-gray-200 border select-none',
          isOpen ? 'block' : 'hidden'
        )}
        style={{ minWidth: '12rem' }}
        onMouseEnter={handleEnterPopup}
        onMouseLeave={handleLeavePopup}
      >
        {children}
      </div>
    </>
  )
}

export default Dropdown
