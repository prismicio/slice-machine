import { Field } from 'formik'
import  { Box, Label, Input, Text }from 'theme-ui'

// import { Col, Flex as FlexGrid } from 'components/Flex'

import ModalFormCard from 'components/ModalFormCard'

const InputBox = ({ name, label, placeholder, error }:{ name: string, label: string, placeholder: string, error?: string }) => (
  <Box mb={2}>
    <Label htmlFor={name} mb={1}>
      { label }
    </Label>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
    />
    { error ? <Text sx={{ color: 'error', mt: 1 }}>{error}</Text>: null}
  </Box>
)

const formId = "create-custom-type"

const CreateCustomtypeForm = ({
  isOpen,
  onSubmit,
  close
}: { isOpen: boolean, onSubmit: Function, close: Function }) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      widthInPx="520px"
      formId={formId}
      close={() => close()}
      onSubmit={(values: {}) => {
        console.log({ values })
        onSubmit(values)
      }}
      validate={({ id }: { id: string }) => {
        if (!id || !id.match(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/)) {
          return { id: 'Invalid id: No special characters allowed' }
        }
      }}
      content={{
        title: 'New Custom Type',
      }}
    >
      {({ errors }: { errors: { id?: string } }) => (
        <Box>
          <InputBox
            name="id"
            label="Custom Type ID"
            placeholder="my-custom-type"
            error={errors.id}
          />
          <InputBox
            name="label"
            label="Custom Type Label"
            placeholder="My Custom Type"
          />
        </Box>
      )}
    </ModalFormCard>
  )
}

export default CreateCustomtypeForm
