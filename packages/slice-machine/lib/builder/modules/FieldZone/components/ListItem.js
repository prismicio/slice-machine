import { Draggable } from 'react-beautiful-dnd'
import { MenuButton, Menu, MenuItem, MenuList } from '@reach/menu-button'
import { useContext } from 'react';
import { ConfigContext } from '../../../../../src/config-context';

import {
  Flex,
  Text,
  theme,
  useThemeUI
} from 'theme-ui'

import Li from 'components/Li'
import IconButton from 'components/IconButton'
import ItemHeader from 'components/ItemHeader'

import * as widgets from 'lib/widgets'

import { MdSettings } from "react-icons/md";
import { BsThreeDotsVertical } from 'react-icons/bs'


const toPrismicVueComponentName = (type) => {
  switch(type) {
    case "StructuredText": return 'prismic-rich-text';
    case "Link": return "prismic-link";
    case "Image": return "prismic-image";
    case "Embed": return "prismic-embed";
    // other types / missing components
    case "Select":
    case "GeoPoint":
    case "Text": 
    case "TimeStamp": 
    case "Number": 
    case "Boolean": 
    case "Color":
    case "Group":
    case "UID":
    case "Date":    
    // any-more?
    default: return ""; // what should be a sane default?
  } 
}

const toVue = (item, modelFieldName, key) => {
  const component = toPrismicVueComponentName(item.value.type);

  return component ? `<${component} :field=slice.${modelFieldName}.${key} />` : `slice.${modelFieldName}.${key}`;
}

const ListItem = ({
  item,
  index,
  deleteItem,
  enterEditMode,
  modelFieldName,
}) => {
  const { key } = item
  const { theme } = useThemeUI()
  const { config: { label }, type } = item.value
  const { env: { framework } } = useContext(ConfigContext);

  const isVue = framework === 'nuxt' || framework === 'vue' ;

  const sliceProperty = isVue ? toVue(item, modelFieldName, key) : `slice.${modelFieldName}.${key}`;

  if (!widgets[type].Meta) {
    return (
      <Li><Text>Field type "{type}" not supported</Text></Li>
    )
  }
  const { Meta: { icon: WidgetIcon } } = widgets[type]

  return (
    <Draggable draggableId={key} index={index}>
      {(provided) => (
        <Li
          ref={provided.innerRef}
          {...provided.draggableProps}
        > 
          {/* here */}
          <ItemHeader 
            theme={theme}
            text={label || key}
            sliceProperty={sliceProperty}
            iconButtonProps={provided.dragHandleProps}
            WidgetIcon={WidgetIcon}
          />
          <Flex sx={{ alignItems: "center" }}>
            <IconButton
              Icon={MdSettings}
              label="Edit slice field"
              sx={{ cursor: "pointer", color: theme.colors.icons }}
              onClick={() => enterEditMode([key, item.value], modelFieldName, index)}
            />
            <Menu>
              <MenuButton className="sliceMenuButton"
                style={{
                  padding: "0",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "transparent",
                  outline: "0",
                }}
              >
                <BsThreeDotsVertical size={20} color={theme.colors.icons} />
              </MenuButton>
              <MenuList style={{
                background: theme.colors.gray,
                border: '1px solid',
                borderRadius: '3px',
                borderColor: theme.colors.borders,
                outline: '0'
              }}>
                <MenuItem
                  style={{ padding: "6px", cursor: "pointer" }}
                  onSelect={() => deleteItem(key)}
                >
                  Delete field
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Li>
      )}
    </Draggable>
  );
}

export default ListItem