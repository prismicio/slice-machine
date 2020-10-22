import { Fragment } from 'react'
import { BsImage, BsFillPlusSquareFill } from 'react-icons/bs'
import { MdCancel } from 'react-icons/md'

import { Text, Badge, Flex } from 'theme-ui'
import IconButton from 'components/IconButton'
import { FormFieldInput } from 'components/FormFields'
import { useField } from 'formik'

export const ThumbnailButton = ({ onClick, error, onDelete, active, text, sx }) => (
  <IconButton
    useActive
    fitButton
    error={error}
    onClick={onClick}
    active={active}
    sx={{ position: 'relative', width: '64px', height:'64px', ...sx, }}
    Icon={() => (
      <Fragment>
        <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <BsImage size={22} />
          <Text mt={1}>{text}</Text>
        </Flex>
        { onDelete ? (
          <Badge onClick={onDelete} variant="circle-right">
            <MdCancel />
          </Badge>
        ) : null}
      </Fragment>
    )}
  />
)

export const AddThumbnailButton = ({ onClick }) => (
  <IconButton
    fitButton
    onClick={onClick}
    sx={{ width: '64px', height:'64px', border: ({ colors }) => `1px solid ${colors.borders}` }}
    Icon={() => (
      <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <BsFillPlusSquareFill size={34} color="#5263BA" />
      </Flex>
    )}
  />
)

export const ConstraintForm = ({
  prefix,
  required,
  display,
  error = {}
}) => {
  if (!display) {
    return null
  }
  const requiredChar = required ? '*' : ''
  const [field, meta, helpers] = useField(prefix)

  const createSetField = (key, fn = e => e) => (e) => {
    helpers.setTouched(true)
    helpers.setValue({ ...field.value, [key]: fn(e.target.value) })
  }
  
  return (
    <Fragment>
      <FormFieldInput
        fieldName={`${prefix}.name`}
        meta={{
          ...meta,
          error: meta.error && meta.error.name
        }}
        formField={{ label: `Name${requiredChar}`, placeholder: 'main' }}
        field={prefix === "constraint"
          ? { value: "main", readOnly: true, }
          : { value: field.value.name, onChange: createSetField('name') }
        }
        variant={prefix === "constraint" ? 'disabled' : 'primary'}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        fieldName={`${prefix}.width`}
        meta={{
          ...meta,
          error: meta.error && meta.error.width
        }}
        formField={{ label: `Width (px)${requiredChar}`, placeholder: ' ' }}
        field={{ type: 'number', value: field.value.width, onChange: createSetField('width', parseInt) }}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        fieldName={`${prefix}.height`}
        meta={{
          ...meta,
          error: meta.error && meta.error.height
        }}
        formField={{ label: `Height (px)${requiredChar}`, placeholder: ' ' }}
        field={{ type: 'number', value: field.value.height, onChange: createSetField('height', parseInt) }}
      />
    </Fragment>
  )
}