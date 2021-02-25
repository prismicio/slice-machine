import TimeConfigForm from 'components/TimeConfigForm'

import { initialValues } from '.'

const Form = (props) => {
  return <TimeConfigForm {...props} initialMockValues={initialValues} />
}

Form.initialValues = initialValues

export const MockConfigForm = Form