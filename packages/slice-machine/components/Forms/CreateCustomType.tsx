import { Field, useField } from 'formik'
import  { Box, Flex, Label, Input, Text, Radio }from 'theme-ui'

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


const FlexCard =  (props: any) => (
  <Flex
    sx={{
      p: 3,
      my: 2,
      alignItems: 'center',
      cursor: 'pointer',
      borderRadius: '3px',
      border: ({ colors }) => `1px solid ${colors.borders}`,
      '&:hover': {
        border: ({ colors }) => `1px solid ${colors.primary}`,
        boxShadow: '0 0 0 3px rgba(81, 99, 186, 0.2)'
      }
    }}
    {...props}
  />
)

const SelectRepeatable = () => {
  const [field, _, helpers] = useField('repeatable')
  return (
    <Box mb={2}>
      <FlexCard onClick={() => helpers.setValue(true)}>
        Is repeatable
        <Radio checked={field.value} />
      </FlexCard>
      <FlexCard onClick={() => helpers.setValue(false)}>
        Is single
        <Radio checked={!field.value} />
      </FlexCard>
    </Box>
  )
}

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
        onSubmit(values)
      }}
      initialValues={{
        repeatable: true
      }}
      validate={({ id }: { id: string }) => {
        if (id && !id.match(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/)) {
          return { id: 'Invalid id: No special characters allowed' }
        }
      }}
      content={{
        title: 'New Custom Type',
      }}
    >
      {({ errors }: { errors: { id?: string } }) => (
        <Box>
          <SelectRepeatable />
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
