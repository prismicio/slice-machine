import Modal from 'react-modal'
import { Formik, Form } from 'formik'
import { Flex, Heading, Close, Box, Button } from 'theme-ui'

import Card from '../Card'

Modal.setAppElement("#__next")

const ModalCard = ({
  children,
  close,
  isOpen,
  formId,
  validate,
  onSubmit,
  initialValues = {},
  content: {
    title
  }
}: {
  children: any,
  close: Function,
  isOpen: boolean,
  formId: string,
  validate?: Function,
  onSubmit: Function,
  initialValues?: any,
  content: { title: string }
}) => (
  <Modal
    isOpen={isOpen}
    shouldCloseOnOverlayClick
    onRequestClose={() => close()}
    contentLabel={title}
  >
    <Formik
      validateOnChange
      initialValues={initialValues}
      validate={(values) => validate ? validate(values) : undefined}
      onSubmit={(values, _) => {
        onSubmit(values)
        close()
      }}
    >
      {({ isValid, isSubmitting, values }) => (
        <Form id={formId}>
          <Card
            borderFooter
            footerSx={{ p: 3 }}
            bodySx={{ p: 4, pt: 3 }}
            sx={{ border: 'none' }}
            Header={({ radius }: { radius: string | number}) => (
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
                <Heading>{title}</Heading>
                <Close onClick={() => close()} />
              </Flex>
            )}
            Footer={(
              <Flex sx={{ alignItems: 'space-between' }}>
                <Box sx={{ ml: 'auto' }} />
                <Button
                  mr={2}
                  type="button"
                  onClick={() => close()}
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
            { children({ isValid, isSubmitting, values }) }
          </Card>
        </Form>
      )}
    </Formik>
  </Modal>
)

export default ModalCard
