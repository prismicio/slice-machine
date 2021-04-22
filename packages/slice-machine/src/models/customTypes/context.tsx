import React, { useState } from 'react'

import { CustomType } from '../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../lib/models/common/CustomType/tab'

export const CustomTypesContext = React.createContext<{
  customTypes: Partial<ReadonlyArray<CustomType<TabsAsObject>>>,
  onCreate?: Function
}>({ customTypes: [] })

export default function Provider ({ children, customTypes = [] }: {
  children: any,
  customTypes: ReadonlyArray<CustomType<TabsAsObject>>,
}) {
  const [cts, setCts] = useState(customTypes)

  const onCreate = (key: string) => {
    setCts([...cts, {
      id: key,
      label: 'My New Model',
      repeatable: true,
      tabs: {
        Main: {}
      }
    }])
  }

  return (
    <CustomTypesContext.Provider value={{ customTypes: cts, onCreate }}>
      { children }
    </CustomTypesContext.Provider>
  )
}
  
