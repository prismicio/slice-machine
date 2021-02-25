import WidgetTypes from './WidgetTypes'

interface BooleanConfig {
  label?: string
  default_value?: boolean
  placeholder_true?: string
  placeholder_false?: string
}

export interface BooleanField {
  type: WidgetTypes.BooleanField
  config?: BooleanConfig
}
