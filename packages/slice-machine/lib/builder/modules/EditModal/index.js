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
  Model,
  variation
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
            variation.replace[fieldType](
              apiId,
              key,
              { config: value, type: initialModelValues.type }
            )
          )
          close()
        }}
      >
        {(props) => {
          const {
            values: { label, id },
            errors,
            isValid,
            isSubmitting,
            initialValues,
            FormFields,
            CustomForm
          } = props
          return (
              <Card
                borderFooter
                footerSx={{ p: 0}}
                bodySx={{ pt: 2, pb: 4, px: 4 }}
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
              </Card>
          )}
        }
      </WidgetForm>
    </Modal>
  )
}

export default EditModal