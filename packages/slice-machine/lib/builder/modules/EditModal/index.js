import Modal from 'react-modal'

import {
  Box,
  Close,
  Flex,
  Button,
  useThemeUI
} from 'theme-ui'

import Card from 'components/Card/WithTabs'
import ItemHeader from 'components/ItemHeader'
import { Flex as FlexGrid, Col } from 'components/Flex'

import WidgetForm from './Form'
import WidgetFormField from './Field'

import * as Widgets from 'lib/widgets'

Modal.setAppElement("#__next");

const FORM_ID = 'edit-modal-form'

const EditModal = ({
  close,
  data,
  Model,
  variation
}) => {
  const { theme } = useThemeUI()
  const {
    isOpen,
    fieldType,
    field: [apiId, initialModelValues]
  } = data

  const { Meta: { icon: WidgetIcon }, MockConfigForm } = Widgets[initialModelValues.type]

  const { initialMockConfig } = Model

  const initialModelValuesWithConfig = {
    ...initialModelValues,
    mockConfig: initialMockConfig[apiId]?.config || {}
  }

  const onMockConfigUpdate = ({ updatedKey, updatedValue, mockConfigValue, setFieldValue }) => {
    setFieldValue('mockConfig', {
      ...mockConfigValue,
      [updatedKey]: updatedValue
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="Widget Form Modal"
      style={{
        overlay: {
          overflow: 'auto',
        },
      }}
    >
      <WidgetForm
        apiId={apiId}
        Model={Model}
        formId={FORM_ID}
        fieldType={fieldType}
        initialModelValues={initialModelValuesWithConfig}
        onUpdateField={(key, value) => {
          Model.hydrate(
            variation.replace[fieldType](
              apiId,
              key,
              { config: value, type: initialModelValuesWithConfig.type }
            )
          )
          close()
        }}
      >
        {(props) => {
          const {
            values: { label, id, mockConfig, ...restValues },
            errors,
            isValid,
            isSubmitting,
            initialValues,
            FormFields,
            CustomForm,

            setFieldValue
          } = props
          return (
              <Card
                borderFooter
                footerSx={{ p: 0, mb: 5 }}
                tabs={['Field Model', 'Mock config']}
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
                    <ItemHeader
                      theme={theme}
                      text={label || id}
                      sliceProperty={`slice.${fieldType}.${id}`}
                      WidgetIcon={WidgetIcon}
                    />
                    <Close onClick={close} type="button" />
                  </Flex>
                )}
                Footer={(
                  <Flex sx={{ alignItems: 'space-between', bg: 'headSection', p: 3}}>
                    <Box sx={{ ml: 'auto' }} />
                    <Button
                      mr={2}
                      type="button"
                      onClick={close}
                      variant="secondary"
                      >
                      Cancel
                    </Button>
                    <Button
                      form={FORM_ID}
                      type="submit"
                      disabled={!isValid && isSubmitting}
                    >
                      Save
                    </Button>
                  </Flex>
                )}
              >
                {
                  CustomForm ? <CustomForm {...props} Model={Model} variation={variation} fieldType={fieldType} /> : (
                    <FlexGrid>
                      {
                        Object.entries(FormFields).map(([key, field]) => (
                          <Col key={key}>
                            <WidgetFormField
                              fieldName={key}
                              fieldType={fieldType}
                              formField={field}
                              variation={variation}
                              errors={errors}
                              initialValues={initialValues}
                            />
                          </Col>
                        ))
                      }
                    </FlexGrid>
                  )
                }
                <Box>
                  { MockConfigForm ? (
                    <MockConfigForm
                      widgetConfig={restValues}
                      mockConfig={mockConfig}
                      onUpdate={(updatedKey, updatedValue) => {
                        onMockConfigUpdate({
                          updatedKey,
                          updatedValue,
                          currentMockConfigValue: mockConfig,
                          setFieldValue
                        })
                      }}
                    />
                  ) : <p>Not ready</p>}
                </Box>
              </Card>
          )}
        }
      </WidgetForm>
    </Modal>
  )
}

export default EditModal