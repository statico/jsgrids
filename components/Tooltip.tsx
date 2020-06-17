import React from 'react'
import { Tooltip as TippyTooltip } from 'react-tippy'

const Tooltip: React.FC<{ tip: string }> = ({ tip, children }) => (
  <TippyTooltip
    title={tip}
    delay={150}
    duration={0}
    size="small"
    theme="dark"
    className="leading-none"
  >
    {children}
  </TippyTooltip>
)

export default Tooltip
