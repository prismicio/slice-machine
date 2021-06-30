import Modal from 'react-modal'
import deepMerge from 'deepmerge'

import {
  Box,
  Alert,
  Close,
  Flex,
  Button,
  useThemeUI
} from 'theme-ui'

import * as yup from 'yup'
import * as Widgets from 'lib/models/common/widgets/withGroup'

import {
  createInitialValues,
  createFieldNameFromKey
} from 'lib/forms'

import { MockConfigKey } from 'lib/consts'

import Card from '../../../../components/Card/WithTabs'
import ItemHeader from '../../../../components/ItemHeader'
import { Flex as FlexGrid, Col } from '../../../../components/Flex'

import WidgetForm from './Form'
import WidgetFormField from './Field'

import { findWidgetByConfigOrType } from '../../utils'


if (process.env.NODE_ENV !== 'test') {
  Modal.setAppElement("#__next");
}

const FORM_ID = 'edit-modal-form'

const EditModal = ({
  close,
  data,
  fields,
  onSave,
  getFieldMockConfig
}) => {
  if (!data.isOpen) {
    return null
  }
  const { theme } = useThemeUI()
  
  const { field: [apiId, initialModelValues] } = data

  const maybeWidget = findWidgetByConfigOrType(Widgets, initialModelValues.config, initialModelValues.type)

  if (!maybeWidget) {
    return (<div>{initialModelValues.type} not found</div>)
  }
  const {
    Meta: { icon: WidgetIcon },
    FormFields,
    MockConfigForm,
    Form: CustomForm,
    schema: widgetSchema
  } = maybeWidget

  const initialValues = {
    id: apiId,
    config: {
      ...createInitialValues(FormFields),
      ...initialModelValues.config,
    },
    [MockConfigKey]: deepMerge(
      MockConfigForm?.initialValues || {},
      getFieldMockConfig({ apiId }) || {}
    ),
  }

  console.log(widgetSchema)
  const validationSchema = yup.object().shape({
    id: yup.string().matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/).min(3).max(35).required(),
    config: widgetSchema.fields.config
  })

  const formId = `${FORM_ID}-${Math.random().toString()}`

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
        formId={formId}
        initialValues={initialValues}
        validationSchema={validationSchema}
        FormFields={FormFields}
        onSave={({ newKey, value }, mockValue) => {
          const maybeUpdatedMockValue = MockConfigForm?.onSave && mockValue && Object.keys(mockValue).length
            ? MockConfigForm.onSave(mockValue, value)
            : mockValue

          const definitiveMockValue = (() => {
            if (maybeUpdatedMockValue && Object.keys(maybeUpdatedMockValue).length
              && !!Object.entries(maybeUpdatedMockValue).find(([, v]) => v !== null)
            ) {
              return maybeUpdatedMockValue
            }
            return null
          })();

          const updatedValue = {
            ...initialModelValues,
            ...value,
            config: {
              ...initialModelValues.config,
              ...value.config
            }
          }

          onSave({ apiId, newKey, value: updatedValue, mockValue: definitiveMockValue })
          close()
        }}
      >
        {(props) => {
          const {
            values: {
              id,
              config: {
                label,
              },
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
                      bg: 'headSection',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopLeftRadius: radius,
                      borderTopRightRadius: radius,
                    }}
                  >
                    <ItemHeader
                      theme={theme}
                      text={label || id}
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
                      form={formId}
                      type="submit"
                      disabled={!isValid && isSubmitting}
                    >
                      Save
                    </Button>
                  </Flex>
                )}
              >
                {
                  CustomForm ? <CustomForm {...props} fields={fields} /> : (
                    <FlexGrid>
                      {
                        Object.entries(FormFields).map(([key, field]) => (
                          <Col key={key}>
                            <WidgetFormField
                              fieldName={createFieldNameFromKey(key)}
                              formField={field}
                              fields={fields}
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
                    <Box>
                      <MockConfigForm initialValues={initialValues} />
                    </Box>
                  ) : <p>Mock Configuration not implemented</p>}
                </Box>
              </Card>
          )}
        }
      </WidgetForm>
    </Modal>
  )
}

export default EditModal