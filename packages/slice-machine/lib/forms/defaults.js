import * as FormTypes from './types'
import { Input } from './fields'

export const DefaultFields = {
  name: Input('Name'),
  id: Input('API ID', {
    min: true,
    max: true,
    required: true,
    matches: [/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'Invalid characters. API id must be of type slug']
  }),
  placeholder: Input('Placholder', null)
}