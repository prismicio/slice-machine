import { Form } from 'formik'
import Modal from 'react-modal'

import {
  Box,
  Close,
  Flex,
  Button,
  useThemeUI
} from 'theme-ui'

import { Flex as FlexGrid, Col } from 'components/Flex'
import Card from 'components/Card'
import ItemHeader from 'components/ItemHeader'

import WidgetForm from './Form'
import WidgetFormField from './Field'

import * as Widgets from 'lib/widgets'

Modal.setAppElement("#__next");

const FORM_ID = 'edit-modal-form'

const EditModal = ({
  close,
  data,
  Model
}) => {
  const { theme } = useThemeUI()
  const {
    isOpen,
    fieldType,
    field: [apiId, initialModelValues]
  } = data

  const { Meta: { icon: WidgetIcon } } = Widgets[initialModelValues.type]

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={close}
      contentLabel="Widget Form Modal"
    >
      <WidgetForm
        apiId={apiId}
        Model={Model}
        formId={FORM_ID}
        fieldType={fieldType}
        initialModelValues={initialModelValues}
        onUpdateField={(key, value) => {
          Model.hydrate(
            Model.replace[fieldType](
              apiId,
              key,
              { config: value, type: initialModelValues.type }
            )
          )
          close()
        }}
      >
        {(props) => {
          const { values: { label, id }, isSubmitting, initialValues, FormFields, CustomForm } = props
          return (
            <Form id={FORM_ID}>
              <Card
                borderFooter
                footerSx={{ p: 3 }}
                bodySx={{ pt: 2, pb: 4, px: 4 }}
                sx={{ border: 'none' }}
                Header={({ radius }) => (
                  <Flex
                    sx={{
                      p: 3,
                      pl: 4,
                      bg: '#FFF',
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
                    <Close onClick={close} />
                  </Flex>
                )}
                Footer={(
                  <Flex sx={{ alignItems: 'space-between' }}>
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
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                  </Flex>
                )}
              >
                {
                  CustomForm ? <CustomForm {...props} Model={Model} fieldType={fieldType} /> : (
                    <FlexGrid>
                      {
                        Object.entries(FormFields).map(([key, field]) => (
                          <Col key={key}>
                            <WidgetFormField
                              fieldName={key}
                              fieldType={fieldType}
                              formField={field}
                              Model={Model}
                              initialValues={initialValues}
                            />
                          </Col>
                        ))
                      }
                    </FlexGrid>
                  )
                }
              </Card>
            </Form>
          )}
        }
      </WidgetForm>
    </Modal>
  )
}

export default EditModal