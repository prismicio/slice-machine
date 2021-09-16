import { Field } from 'formik'
import  { Button, Heading, Box, Label, Input, Text }from 'theme-ui'

import ModalFormCard from '../../../../components/ModalFormCard'

export enum ActionType {
  UPDATE = 'update',
  DELETE = 'delete'
}

const InputBox = ({ name, label, placeholder, error, ...rest }:{ name: string, label: string, placeholder: string, error?: string, [x: string]: any }) => (
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
      {...rest}
    />
    { error ? <Text sx={{ color: 'error', mt: 1 }}>{error}</Text>: null}
  </Box>
)

const formId = "update-tab"

const UpdateCustomTypeTabForm = ({
  title,
  isOpen,
  onSubmit,
  close,
  tabIds,
  allowDelete
}: {
  title: string,
  isOpen: boolean,
  onSubmit: Function,
  close: Function,
  tabIds: ReadonlyArray<string>,
  allowDelete: boolean
}) => {

  return (
    <ModalFormCard
      omitFooter
      isOpen={isOpen}
      widthInPx="530px"
      formId={formId}
      close={() => close()}
      cardProps={{ bodySx: { p: 0 } }}
      onSubmit={(values: {}) => {
        onSubmit(values)
      }}
      initialValues={{
        id: '',
        actionType: null
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
      {({ errors, values, setFieldValue }: { errors: { id?: string }, values: { id: string }, setFieldValue: Function }) => (
        <Box>
          <Box sx={{ px: 4, py: 4 }}>
            <InputBox
              name="id"
              label="Update Tab ID"
              placeholder="Tab"
              error={errors.id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue('id', e.target.value.trim())
                setFieldValue('actionType', ActionType.UPDATE)
              }}
            />
            <Button
              type="button"
              sx={{ mt: 3, width: '100%' }}
              onClick={() => {
                onSubmit({
                  id: values.id,
                  actionType: ActionType.UPDATE
                })
                close()
              }}
            >
              Save
            </Button>
          </Box>
          <Box as="hr" sx={{ borderBottom: 'none', borderTop: theme => `1px solid ${theme?.colors?.borders}` }} />
          {
            allowDelete && (
              <Box sx={{ px: 4, py: 4 }}>
                <Heading as="h4">Delete this tab?</Heading>
                <Text as="p" color="textClear" sx={{ mt: 2 }}>This action cannot be undone.</Text>
                <Button
                  type="button"
                  variant="buttons.actionDelete"
                  sx={{ mt: 3 }}
                  onClick={() => {
                    onSubmit({
                      id: values.id,
                      actionType: ActionType.DELETE
                    })
                    close()
                  }}
                >
                  Yes, delete tab
                </Button>
              </Box>
            )
          }
        </Box>
      )}
    </ModalFormCard>
  )
}

export default UpdateCustomTypeTabForm
