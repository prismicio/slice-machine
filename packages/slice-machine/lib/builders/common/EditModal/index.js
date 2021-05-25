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

import * as Widgets from 'lib/models/common/widgets/withGroup'

import { removeKeys } from 'lib/utils'
import { createInitialValues, createValidationSchema } from 'lib/forms'

import { MockConfigKey } from 'lib/consts'

import Card from '../../../../components/Card/WithTabs'
import ItemHeader from '../../../../components/ItemHeader'
import { Flex as FlexGrid, Col } from '../../../../components/Flex'

import WidgetForm from './Form'
import WidgetFormField from './Field'

import { findWidgetByConfigOrType } from '../../utils'

Modal.setAppElement("#__next");

const FORM_ID = 'edit-modal-form'

const EditModal = ({
  close,
  data,
  Model,
  fields,
  onSave,
  getFieldMockConfig
}) => {
  if (!data.isOpen) {
    return null
  }
  const { theme } = useThemeUI()
  
  const { mockConfig: initialMockConfig } = Model
  const { field: [apiId, initialModelValues] } = data

  const {
    Meta: { icon: WidgetIcon },
    FormFields,
    MockConfigForm,
    Form: CustomForm
  } = findWidgetByConfigOrType(Widgets, initialModelValues.config, initialModelValues.type)

  if (!FormFields) {
    return (<div>{initialModelValues.type} not supported yet</div>)
  }

  const initialValues = {
    ...createInitialValues(FormFields),
    ...removeKeys(initialModelValues.config, ['type']),
    [MockConfigKey]: deepMerge(
      MockConfigForm?.initialValues || {},
      getFieldMockConfig({ apiId }) || {}
    ),
    id: apiId,
  }

  const validationSchema = createValidationSchema(FormFields)

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
          const updatedMockValue = MockConfigForm?.onSave && mockValue && Object.keys(mockValue).length
            ? MockConfigForm.onSave(mockValue, value)
            : mockValue
          onSave({ apiId, newKey, value, initialModelValues }, { initialMockConfig, mockValue: updatedMockValue })
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
                              fieldName={key}
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
                      {/* {
                        fieldType === 'items' ? (
                          <Alert mb={3} variant="highlight">
                            Note: setting mock content for repeatable fields will set all items to the same value!
                          </Alert>
                        ) : null
                      } */}
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