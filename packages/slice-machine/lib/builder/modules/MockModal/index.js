import Modal from 'react-modal'
import { useState, useContext } from 'react'

import { Tabs, TabPanel } from 'react-tabs'
import { CustomTab as Tab, CustomTabList as TabList } from 'components/Card/WithTabs/components'

import { ConfigContext } from 'src/config-context'

import {
  Close,
  Flex,
  Heading,
  Box,
  Card as TCard,
} from 'theme-ui'

import Card from 'components/Card'

import * as Widgets from 'lib/widgets'

Modal.setAppElement("#__next");

const MockModal = ({
  close,
  data,
  Model,
  variation
}) => {
  const { name: sliceName } = Model.meta
  const { env: { mockConfig: initialMockConfig } } = useContext(ConfigContext)

  const [mockConfig, setMockConfig] = useState(initialMockConfig[sliceName] || {})

  const updateMockConfig = (key, value) => {
    setMockConfig({ ...mockConfig, [key]: value })
  }

  return (
    <Modal
      isOpen={true}
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="Widget Form Modal"
      style={{
        overlay: {
          overflow: 'auto',
        },
      }}
    >
      <Card
        borderFooter
        footerSx={{ p: 3 }}
        bodySx={{ pt: 2, pb: 4, px: 4, mb: 5 }}
        sx={{ border: 'none' }}
        Header={({ radius }) => (
          <Flex
            sx={{
              p: 3,
              pl: 4,
              bg: 'headSection',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: t => `1px solid ${t.colors.borders}`
            }}
          >
            <Heading>Edit Mocks</Heading>
            <Close onClick={close} />
          </Flex>
        )}
      >
        {
          variation.primary.map((item, i) => {
            const { MockConfigForm, MockConfigContent } = Widgets[item.value.type]
            const defaultIndex = mockConfig[item.key]?.content ? 1 : 0

            return (
              <TCard key={item.key} sx={{ my: 3 }}>
                <Heading p={2} as="h3">{item.key}</Heading>
                <Box mt={2}>
                  <Tabs defaultIndex={defaultIndex}>
                    <TabList>
                      <Tab>Use Config</Tab>
                      <Tab>Use Content</Tab>
                    </TabList>
                    <TabPanel>
                      {
                        MockConfigForm ? (
                          <MockConfigForm
                            log={!i}
                            widgetConfig={item.value.config}
                            mockConfig={mockConfig[item.key]?.config || {}}
                          />
                        ) : null
                      }
                    </TabPanel>
                    <TabPanel>

                    </TabPanel>
                  </Tabs>
                </Box>
              </TCard>
            )
          })
        }
      </Card>
    </Modal>
  )
}

export default MockModal
