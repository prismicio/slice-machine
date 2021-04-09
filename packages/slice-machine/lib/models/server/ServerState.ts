import Environment from '../../../lib/models/common/Environment'
import Slice from '../../../lib/models/common/Slice'
import Warning from '../../../lib/models/common/Warning'
import ErrorWithStatus from '../../../lib/models/common/ErrorWithStatus'
import { Library } from '../../../lib/models/common/Library'
import { AsObject } from '../../../lib/models/common/Variation'

import { CustomType } from '../../../lib/models/common/CustomType'
import { TabsAsObject } from '../common/CustomType/tab'

import ServerError from './ServerError'

export interface ServerState {
  libraries: ReadonlyArray<Library>
  customTypes: ReadonlyArray<CustomType<TabsAsObject>>
  remoteSlices: ReadonlyArray<Slice<AsObject>>
  clientError?: ErrorWithStatus
  configErrors: { errors?: {[errorKey: string]: ServerError} }
  env: Environment
  warnings: ReadonlyArray<Warning>
}