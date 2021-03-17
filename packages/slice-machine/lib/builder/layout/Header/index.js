import { useState } from 'react'
import {
  Box,
  Flex,
  Button,
} from 'theme-ui'
import MetaData from './MetaData'
import VariationModal from './VariationModal'
import Link from 'next/link'
import Card from '../../../../components/Card/Default'
import { useRouter } from 'next/router'
import Select, { components } from 'react-select'
import * as Links from '../../links'
import VariationPopover from './VariationsPopover'

const Header = ({ Model, store, variation }) => {
  const router = useRouter()
  const [showMeta, setShowMeta] = useState(false)
  const [showVariationModal, setShowVariationModal] = useState(false)

  return (
    <Flex
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: '0 auto',
          maxWidth: 1224,
          mx: 'auto',
          px: 3,
          pt: 4,
        }}
      >

        <Box as="section" sx={{
          flexGrow: 99999,
          flexBasis: 0,
          minWidth: 320,
        }}>
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Flex sx={{flexDirection: 'column'}}>
                <Box as="h2" sx={{ pb:3 }}>
                  {Model.infos.sliceName}
                </Box>
                <Flex sx={{alignItems: 'center'}}>
                  <Box as="div" sx={{ pb: 3, mr: 4 }}>
                    <Box as="h5" sx={{ mb: 1 }}>{variation.name}</Box>
                    <Box>ID: {variation.id}</Box>
                  </Box>
                  { Model.variations.length > 1 && (
                    <Box sx={{ p: 2 }}>
                      <VariationPopover
                        defaultVariation={variation}
                        variations={Model.variations}
                        onChange={(v) => router.push(...Links.variation(Model.href, Model.jsonModel.name, v.id).all)} />
                    </Box>
                  )}
                </Flex>
              </Flex>
            </Box>

            <span>
              <Button onClick={() => setShowVariationModal(true)}>+ Add new variation</Button>
            </span>
            <VariationModal
              isOpen={showVariationModal}
              onClose={() => setShowVariationModal(false)}
              onSubmit={(id, name, copiedVariation) => {
                store.copyVariation(id, name, copiedVariation)
                store.save(Model)
                router.push(...Links.variation(Model.from, Model.infos.sliceName, id).all)
              }}
              initialVariation={variation}
              variations={Model.variations}
            />
          </Flex>
          <hr />

        </Box>
        <MetaData isOpen={showMeta} Model={Model} close={() => setShowMeta(false)}/>
      </Flex>
  )
}

// const DropdownIndicator = (props) => {
//   return (
//     <div {...props} style={{
//       position: 'absolute',
//       bottom: 0,
//       top: 0,
//       left: 0,
//       right: 0
//       }}>
//     </div>
//   );
// };

// const IndicatorSeparator = () => ''

export default Header
