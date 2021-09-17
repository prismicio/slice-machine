import { useState } from 'react'
import { CustomTypeState } from '../../../models/ui/CustomTypeState'
import { AiOutlinePlus } from 'react-icons/ai'
import IconButton from 'components/IconButton'

import { Box, Button, Flex, useThemeUI } from 'theme-ui'
import { Tabs, TabPanel } from 'react-tabs'

import { HiOutlineCog } from 'react-icons/hi'

import { CustomTab as Tab, CustomTabList as TabList } from '../../../../components/Card/WithTabs/components'

import FlexWrapper from './FlexWrapper'

import CreateModal from '../TabModal/create'
import UpdateModal, { ActionType as UpdateModalActionType } from '../TabModal/update'
import CustomTypeStore from 'src/models/customType/store'

enum ModalType {
  CREATE = 'create', UPDATE = 'udate'
}
interface EditState {
  title: string
  type: ModalType
  key: string
}

interface CreateState {
  title: string
  type: ModalType
}

type ModalState = EditState | CreateState

const Icon = ({ theme, onClick }: { theme: any, onClick: Function }) => (
  <IconButton
    size={20}
    error={null}
    Icon={HiOutlineCog}
    label="Edit tab"
    sx={{ cursor: "pointer", color: theme.colors.icons }}
    onClick={onClick}
  />
)

const CtTabs = ({ sx, Model, store, renderTab }: { sx?: any, Model: CustomTypeState, store: CustomTypeStore, renderTab: Function }) => {
  const { theme } = useThemeUI()

  const [tabIndex, setTabIndex] = useState<number>(0)
  const [state, setState] = useState<ModalState | undefined>()

  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper sx={sx}>
        <Tabs
          selectedIndex={tabIndex}
          onSelect={index => setTabIndex(index)}
          style={{ width: '100%' }}
        >
          <TabList>
            {
              Model.current.tabs.map((tab, i) => (
                <Tab
                  key={tab.key}
                  style={{
                    display: 'flex',
                    height: '48px'
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    {tab.key}
                    &nbsp;
                    {
                      i === tabIndex ? (
                        <Icon
                          theme={theme}
                          onClick={(e: Event) => {
                            e.preventDefault()
                            setState({ title: 'Edit Tab', type: ModalType.UPDATE, key: tab.key })
                          }}
                        />
                      ) : null
                    }
                  </Flex>
                </Tab>
              ))
            }
            <Tab
              key={'new-tab'}
              style={{ height: '48px' }}
              disabled
              onClick={() => setState({ title: 'Add Tab', type: ModalType.CREATE })}
            >
              <Button variant="transparent" sx={{ m: 0, color: 'text' }}>
                <AiOutlinePlus style={{ position: 'relative', top: '2px'}} /> Add Tab
              </Button>
            </Tab>
          </TabList>
          {
            Model.current.tabs.map(tab => <TabPanel key={tab.key}>{renderTab(tab)}</TabPanel>)
          }
          <TabPanel key={'new-tab'} />
        </Tabs>
      </FlexWrapper>
      {
        state?.type === ModalType.CREATE ? (
          <CreateModal
            {...state}
            isOpen
            tabIds={Model.current.tabs.map(e => e.key.toLowerCase())}
            close={() => setState(undefined)}
            onSubmit={({ id }: { id: string }) => {
              store.createTab(id)
              // current.tabs is not updated yet
              setTabIndex(Model.current.tabs.length)
            }}
          />
        ) : null
      }
      {
        state?.type === ModalType.UPDATE ? (
          <UpdateModal
            {...state}
            isOpen
            tabIds={Model.current.tabs.filter(e => e.key !== (state as EditState).key).map(e => e.key.toLowerCase())}
            close={() => setState(undefined)}
            onSubmit={({ id, actionType }: { id: string, actionType: UpdateModalActionType }) => {
              if (actionType === UpdateModalActionType.UPDATE) {
                return store.tab((state as EditState).key).update(id)
              }
              if (actionType === UpdateModalActionType.DELETE) {
                store.tab((state as EditState).key).delete()
                setTabIndex(0)
              }
            }}
          />
        ) : null
      }
    </Box>
  )
}

export default CtTabs