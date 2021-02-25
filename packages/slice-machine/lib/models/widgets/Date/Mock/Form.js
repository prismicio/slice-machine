import TimeConfigForm from 'components/TimeConfigForm'

import { initialValues } from '.'

const Form = (props) => {
  return <TimeConfigForm {...props} initialMockValues={initialValues} formatDate={d => d.toISOString().split('T')[0]} />
}

Form.initialValues = initialValues

export const MockConfigForm = Form