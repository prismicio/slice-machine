import Modal from 'react-modal'
import deepMerge from 'deepmerge'

import {
  Box,
  Close,
  Flex,
  Button,
  useThemeUI
} from 'theme-ui'

import * as Widgets from 'lib/widgets'

import { createInitialValues, createValidationSchema } from 'lib/forms'

import { MockConfigKey } from 'src/consts'

import Card from 'components/Card/WithTabs'
import ItemHeader from 'components/ItemHeader'
import { Flex as FlexGrid, Col } from 'components/Flex'

import WidgetForm from './Form'
import WidgetFormField from './Field'

Modal.setAppElement("#__next");

const FORM_ID = 'edit-modal-form'

const removeKeys = (obj, keys) =>
  Object.entries(obj)
    .filter(([key]) => keys.indexOf(key) === -1)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

const EditModal = ({
  close,
  data,
  Model,
  variation
}) => {

  const { theme } = useThemeUI()
  
  const { mockConfig: initialMockConfig } = Model
  const { fieldType, field: [apiId, initialModelValues] } = data
  const {
    Meta: { icon: WidgetIcon },
    FormFields,
    MockConfigForm,
    Form: CustomForm
  } = Widgets[initialModelValues.type]

  if (!FormFields) {
    return (<div>{type} not supported yet</div>)
  }

  const initialValues = {
    ...createInitialValues(FormFields),
    ...removeKeys(initialModelValues, ['config']),
    ...initialModelValues.config,
    [MockConfigKey]: deepMerge(MockConfigForm?.initialValues || {}, initialMockConfig?.[fieldType]?.[apiId] || {}),
    id: apiId,
  }

  const validationSchema = createValidationSchema(FormFields)

  return (
    <Modal
      isOpen
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        FormFields={FormFields}
        onSave={({ newKey, value }, mockValue) => {
          Model.hydrate(() => {
            Model.updateMockConfig({
              prevId: apiId,
              newId: newKey,
              fieldType,
              value: mockValue
            })
            variation.replace[fieldType](
              apiId,
              newKey,
              { config: value, type: initialModelValues.type }
            )
          })
          close()
        }}
      >
        {(props) => {
          const {
            values: {
              id,
              label,
            },
            errors,
            isValid,
            isSubmitting,
            initialValues,
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
                    <MockConfigForm />
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