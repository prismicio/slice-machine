
export enum InitOperationStatus {
  SUCCESS = 'success',
  FAILURE = 'failure'
}

export interface InitOperation {
  status: InitOperationStatus,
  content: string
}
