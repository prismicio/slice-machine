import WidgetTypes from './WidgetTypes'

interface ColorConfig {
  label?: string
  placeholder?: string
}
export interface Color {
  type: WidgetTypes.Color
  fieldset?: string
  config?: ColorConfig
}