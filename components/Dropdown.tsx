import { createPopper } from '@popperjs/core'
import classnames from 'classnames'
import React, { createRef, useEffect, useState } from 'react'

export const Dropdown: React.FC<{
  button: React.ReactNode
}> = ({ button, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const buttonRef = createRef<HTMLButtonElement>()
  const popupRef = createRef<HTMLDivElement>()

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!isOpen && buttonRef.current && popupRef.current) {
      createPopper(buttonRef.current, popupRef.current, {
        placement: 'bottom-start',
      })
    }
    setIsOpen(!isOpen)
  }

  const handlePopupClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  const handleDocumentClick = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Element) &&
      popupRef.current &&
      !popupRef.current.contains(event.target as Element)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick)
    return () => {
      document.body.removeEventListener('click', handleDocumentClick)
    }
  })

  return (
    <>
      <button
        className="inline-block active:text-black"
        ref={buttonRef}
        onClick={handleButtonClick}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {button}
      </button>
      <div
        ref={popupRef}
        className={classnames(
          'bg-white z-30 rounded-sm shadow-lg text-left mt-1',
          'border-gray-200 border select-none',
          isOpen ? 'block' : 'hidden'
        )}
        onClick={handlePopupClick}
        style={{ minWidth: '12rem' }}
        hidden={isOpen}
      >
        {children}
      </div>
    </>
  )
}

export default Dropdown
