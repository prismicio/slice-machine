import * as yup from 'yup'
import { useEffect, useState, Fragment } from 'react'
import { DefaultFields } from 'lib/forms/defaults'


import WidgetFormField from 'lib/builders/common/EditModal/Field'

import { FieldArray } from 'formik'

import { Label, Card, Flex } from 'theme-ui'
import { Col, Flex as FlexGrid } from 'components/Flex'
import {
  ThumbnailButton,
  AddThumbnailButton,
  ConstraintForm
} from './components'

const FormFields = {
  id: DefaultFields.id,
  label: DefaultFields.label
}

const EMPTY_THUMBNAIL = {
  name: '',
  width: '',
  height: ''
}

const thumbText = ({ width, height } = {}, allowAuto) => {
  if (allowAuto && !width && !height) {
    return 'auto'
  }
  if (width || height) {
    return `${width ? width : 'auto'}x${height ? height : 'auto'}`
  }
  return '...'
}

const Form = (props) => {
  const [thumbI, setThumbI] = useState(0)
  const {
    initialValues,
    values: formValues,
    errors,
    fields,
    touched
  } = props
  
  const { thumbnails, constraint } = formValues

  useEffect(() => {
    setThumbI(thumbnails.length)
  }, [thumbnails.length])
  return (
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
      <Col>
        <Label
          htmlFor="thumbnails"
          variant="label.primary"
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Responsive views*
        </Label>
        <Card p={3}>
          <FieldArray
            name="thumbnails"
            render={({ push, remove }) => (
              <Fragment>
                <Flex mb={3}>
                  <ThumbnailButton
                    active={thumbI === 0}
                    text={thumbText(constraint, true)}
                    sx={{ mr: 2 }}
                    onClick={() => setThumbI(0)}
                  />
                  {
                    thumbnails.map((e, i) => (
                      <ThumbnailButton
                        key={`thumbnail-button-${i + 1}`}
                        sx={{ mr: 3 }}
                        active={thumbI === i + 1}
                        text={thumbText(e)}
                        error={
                          errors.thumbnails
                          && touched.thumbnails
                          && touched.thumbnails[i]
                          && errors.thumbnails[i]}
                        onDelete={() => remove(i)}
                        onClick={() => setThumbI(i + 1)}
                      />
                    ))
                  }
                  <AddThumbnailButton
                    onClick={() => {
                      push(EMPTY_THUMBNAIL)
                    }}
                  />
                </Flex>
                <ConstraintForm
                  {...props}
                  display={thumbI === 0}
                  prefix="constraint"
                />
                {
                  thumbnails.map((_, i) => (
                    <ConstraintForm
                      {...props}
                      required
                      key={`thumbnail-${i + 1}`}
                      display={thumbI === i + 1}
                      prefix={`thumbnails[${i}]`}
                    />
                  ))
                }
              </Fragment>
            )}
          />
        </Card>
      </Col>
    </FlexGrid>
  )
}

FormFields.constraint = {
  validate: () => yup.object().defined().shape({
    width: yup.number().nullable(),
    height: yup.number().nullable(),
  })
}

FormFields.thumbnails = {
  validate: () => yup.array().defined().of(
    yup.object().test({
      name: 'Thumbnails',
      message: 'Must set name and width or height at minimum',
      test: function(value) {
        if (!value.name) {
          return false
        }
        if (!value.width && !value.height || typeof value.width !== 'number' || typeof value.height !== 'number') {
          return false
        }
        return true
      }
    })
  )
}

export { FormFields }

export default Form