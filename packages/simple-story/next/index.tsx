import React, { Fragment } from 'react'


export default function SimpleStory(props) {
  console.log({ props })
  return (
    <div>
      {
        props.libraries.map(lib => (
          <div key={lib.name}>
            <h3>{ lib.name }</h3>
            <ul>
              {
                lib.components.map(comp => {
                  const Component = props.resolver({ sliceName: comp.infos.sliceName })
                  return (
                    <ul key={comp.infos.sliceName}>
                      {
                        comp.infos.mock.length ?  (
                          <Fragment>
                            {
                              comp.infos.mock.map(mock => (
                                <li key={`${comp.infos.sliceName}-${mock.variation}`}>
                                  Render: <br/>
                                  <Component key={comp.infos.sliceName} slice={mock} />
                                </li>
                              ))
                            }
                          </Fragment>
                        ) : (
                          <li>No mocks found</li>
                        )
                      }
                    </ul>
                  )
                })
              }
            </ul>
          </div>
        ))
      }
    </div>
  )
}



// {
//   previewUrl: "http://localhost:3000/__preview"
// }

// 0.
//  preview is not configured
// 1. ping()
//   preview is available
// 2. onclick general ()
//   redirect http://localhost:3000/__preview

// 3. onclick slice (sliceName)
// redirect http://localhost:3000/__preview/sliceName
