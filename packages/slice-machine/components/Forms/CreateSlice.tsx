import { Field } from 'formik'
import  { Box, Label, Input, Text }from 'theme-ui'

import Select from 'react-select'

import ModalFormCard from '../../components/ModalFormCard'
import camelCase from 'lodash/camelCase'
import startCase from 'lodash/startCase'


const InputBox = ({ name, label, placeholder, error }:{ name: string, label: string, placeholder: string, error?: string | null }) => (
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
    { error ? <Text as="p" sx={{ color: 'error', mt: 1 }}>{error}</Text>: null}
  </Box>
)

const formId = "create-new-slice"

const CreateSlice = ({
  isOpen,
  onSubmit,
  close,
  libraries
}: { isOpen: boolean, onSubmit: Function, close: Function, libraries: ReadonlyArray<{ name: string }> }) => {

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
        sliceName: '',
        from: libraries[0].name
      }}
      validate={({ sliceName }: { sliceName: string }) => {
        if (!sliceName) {
          return { sliceName: 'Cannot be empty'}
        }
        if (!sliceName.match(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/)) {
          return { sliceName: 'No special character allowed' }
        }
        const cased = startCase(camelCase(sliceName)).replace(/\s/gm, '')
        if (cased !== sliceName.trim()) {
          return { sliceName: 'Value has to be PascalCased' }
        }
      }}
      content={{
        title: 'Create a new slice',
      }}
    >
      {({ errors, touched, values, setFieldValue }: { errors: { sliceName?: string }, touched: { sliceName?: string }, values: any, setFieldValue: Function }) => (
        <Box>
          <InputBox
            name="sliceName"
            label="Slice Name"
            placeholder="MySlice"
            error={touched.sliceName ? errors.sliceName : null}
          />
          <Label htmlFor="origin" sx={{ mb: 2 }}>Target Library</Label>
          <Select
            name="origin"
            options={libraries.map(v => ({ value: v.name, label: v.name}))}
            onChange={(v: { label: string, value: string} | null) => {
              if (v) {
                setFieldValue('from', v.value)
              }
            }}
            defaultValue={{ value: values.from, label: values.from }}
            theme={(theme) => {
              return {
              ...theme,
              colors: {
              ...theme.colors,
                text: 'text',
                primary: 'background',
              },
            }}}
          />
        </Box>
      )}
    </ModalFormCard>
  )
}

export default CreateSlice
