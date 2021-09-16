import React from 'react'
import { CustomTypeState } from '@lib/models/ui/CustomTypeState'

interface UidToggleProps {
  Model: CustomTypeState
  onToggle: () => void
}

export const UidToggle: React.FC<UidToggleProps> = ({
  Model,
  onToggle
}) => {
  const uid = Model.current.uid
  return <button onClick={onToggle}>UID Toggle -- Uid {uid ? "activated" : "deactivated"} {uid && `-- originaly located on Tab ${uid.tab} with the ID ${uid.fieldId}`}</button>
}