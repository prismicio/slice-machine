import { Widget } from './widgets'
// @ts-ignore
import { pascalize } from '../../utils/str'

export enum WidgetsArea {
  Primary = 'primary',
  Items = 'items'
}

export interface Variation<F extends AsArray | AsObject> {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly imageUrl: string
    readonly docURL: string
    readonly version: string
    readonly display?: string
    readonly primary: F
    readonly items: F
}

export type AsArray = ReadonlyArray<{key: string, value: Widget}>

export type AsObject = { [key: string]: Widget }

export const Variation = {
  generateId(input: string): string {
    input = input.replace(/^\s+|\s+$/g, ''); // trim
    input = input.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
      input = input.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
  
    input = input.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  
    return pascalize(input);
  },

  toObject(variation: Variation<AsArray>): Variation<AsObject> {
    return {
      ...variation,
      primary: variation.primary.reduce((acc, {key, value}) => ( { ...acc, [key]: value } ), {}),
      items: variation.items.reduce((acc, {key, value}) => ( { ...acc, [key]: value } ), {})
    }
  },

  toArray(variation: Variation<AsObject>): Variation<AsArray> {
    return {
      ...variation,
      primary: Object.entries(variation.primary).map(([key, value]) => ({ key, value })),
      items: Object.entries(variation.items).map(([key, value]) => ({ key, value }))
    }
  },

  reorderWidget(variation: Variation<AsArray>, widgetsArea: WidgetsArea, start: number, end: number): Variation<AsArray> {
    const reorderedWidget: {key: string, value: Widget} | undefined = variation[widgetsArea][start]
    if(!reorderedWidget) throw new Error(`Unable to reorder the widget at index ${start}. the list of widgets contains only ${variation[widgetsArea].length} elements.`)

    const reorderedArea = variation[widgetsArea].reduce<AsArray>((acc, widget, index) => {
      switch(index) {
        case start: return acc
        case end: return [ ...acc, reorderedWidget, widget ]
        default: return [ ...acc, widget ]
      }
    }, [])
    return {
      ...variation,
      [widgetsArea]: reorderedArea
    }
  },

  replaceWidget(variation: Variation<AsArray>, widgetsArea: WidgetsArea, previousKey: string, newKey: string, newValue: Widget): Variation<AsArray> { 
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea].reduce((acc: AsArray, { key, value }) => {
        if(key === previousKey) {
          return acc.concat([{ key: newKey, value: newValue }])
        } else {
          return acc.concat([{ key, value }])
        }
      }, [])
    }
  },

  addWidget(variation: Variation<AsArray>, widgetsArea: WidgetsArea, key: string, value: Widget): Variation<AsArray> {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea].concat([{ key, value }])
    }
  },

  deleteWidget(variation: Variation<AsArray>, widgetsArea: WidgetsArea, widgetKey: string): Variation<AsArray> {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea]?.filter(({ key }) => widgetKey !== key)
    }
  },

  copyValue<T extends AsArray | AsObject>(variation: Variation<T>, key: string, name: string): Variation<T> {
    return {
      ...variation,
      id: key,
      name
    }
  }
}
