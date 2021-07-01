import { FieldArray } from 'formik'
import { Checkbox } from 'theme-ui'
import ModalFormCard from '../../../../components/ModalFormCard'
import SliceState from '../../../models/ui/SliceState'

import SliceList from '../../../../components/SliceList'

const Form = ({
  isOpen,
  formId,
  close,
  onSubmit,
  availableSlices,
  slicesInSliceZone
}: {
  isOpen: boolean,
  formId: string,
  close: Function,
  onSubmit: Function,
  availableSlices: ReadonlyArray<SliceState>,
  slicesInSliceZone: ReadonlyArray<SliceState>,
}) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      formId={formId}
      close={() => close()}
      onSubmit={(values: any) => onSubmit(values)}
      initialValues={{ sliceKeys: slicesInSliceZone.map(slice => slice.infos.meta.id) }}
      content={{
        title: 'Update SliceZone',
      }}
    >
      {({ values }:  { values: { sliceKeys: any }}) => (
        <FieldArray
          name="sliceKeys"
          render={arrayHelpers => {
            return (
              <SliceList
                slices={availableSlices}
                gridProps={{
                  gridTemplateMinPx: "200px"
                }}
                cardProps={{
                  heightInPx: '220px',
                  hideVariations: true,
                  renderSliceState(slice: SliceState) {
                    const isInSliceZone = values.sliceKeys.includes(slice.infos.meta.id)
                    return isInSliceZone ? (
                      <Checkbox value="true" defaultChecked />
                    ) : <Checkbox value="false" />
                  }
                }}
                CardWrapper={({ slice, children }: { slice: SliceState, children: any }) => {
                  return (
                    <div
                      onClick={() => {
                        const isInSliceZone = values.sliceKeys.includes(slice.infos.meta.id)
                        if (isInSliceZone) {
                          return arrayHelpers.remove(values.sliceKeys.indexOf(slice.infos.meta.id))
                        }
                        arrayHelpers.push(slice.infos.meta.id)
                      }}
                      key={`${slice.from}-${slice.infos.sliceName}`}
                    >
                      { children }
                    </div>
                  )
                }}
              />
            )
          }}
        />
      )}
    </ModalFormCard>
  )
}

export default Form
