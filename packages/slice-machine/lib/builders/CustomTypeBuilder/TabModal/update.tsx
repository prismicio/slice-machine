import { Field } from 'formik'
import  { Box, Label, Input, Text }from 'theme-ui'

import ModalFormCard from '../../../../components/ModalFormCard'

const InputBox = ({ name, label, placeholder, error }:{ name: string, label: string, placeholder: string, error?: string }) => (
  <Box mb={3}>
    <Label htmlFor={name} mb={2}>
      { label }
    </Label>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
      autoComplete="off"
    />
    { error ? <Text sx={{ color: 'error', mt: 1 }}>{error}</Text>: null}
  </Box>
)

const formId = "create-tab"

const CreateCustomtypeForm = ({
  title,
  isOpen,
  onSubmit,
  close,
  tabIds

}: {
  title: string,
  isOpen: boolean,
  onSubmit: Function,
  close: Function,
  tabIds: ReadonlyArray<string>
}) => {

  return (
    <ModalFormCard
      isOpen={isOpen}
      widthInPx="530px"
      formId={formId}
      close={() => close()}
      onSubmit={(values: {}) => {
        onSubmit(values)
      }}
      initialValues={{
        repeatable: true
      }}
      validate={({ id }: { id: string }) => {
        if (!id) {
          return {
            id: 'Tab ID is required'
          }
        }
        if (tabIds.includes(id.toLowerCase())) {
          return {
            id: 'Tab exists already'
          }
        }
      }}
      content={{
        title,
      }}
    >
      {({ errors }: { errors: { id?: string } }) => (
        <Box>
          <InputBox
            name="id"
            label="New Tab ID"
            placeholder="Tab"
            error={errors.id}
          />
        </Box>
      )}
    </ModalFormCard>
  )
}

export default CreateCustomtypeForm
