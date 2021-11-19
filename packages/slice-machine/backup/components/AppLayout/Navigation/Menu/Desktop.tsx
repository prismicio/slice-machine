// /**
//  * @jest-environment jsdom
//  */
// import React from 'react'
// // import useSliceMachineActions from "@src/modules/useSliceMachineActions";
// // import {render, screen} from '../../../../test-utils'
// import {render, screen} from '@testing-library/react'
// // import Desktop from '@components/AppLayout/Navigation/Menu/Desktop';

// const Desktop = () => <div>Update Available</div>

// const DEFAULT_STATE = {
//   modal: {
//     LOGIN: false,
//     NEW_VERSION: false
//   },
//   updateVersionInfo: {
//     updateCommand: 'npm i -D slice-machine-ui',
//     packageManager: 'npm',
//     update: false,
//     current: '0.1.1',
//     recent: '0.1.1'
//   },
// }

// const UPDATE_REQUIRED_STATE = {
//   ...DEFAULT_STATE,
//   updateVersionInfo: {
//     ...DEFAULT_STATE.updateVersionInfo,
//     update: true
//   }
// }

// test('should not show message if no update is required', () => {
//   // render(<Desktop />, {preloadedState: DEFAULT_STATE})
//   render(<Desktop />)
//   expect(screen.findAllByText("Update Available")).not.toBeInTheDocument()
// })
