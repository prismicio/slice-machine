export const fetchApi = ({
  url,
  fetchparams = { method: 'GET' },
  setData,
  setDataParams = [],
  successMessage,
  errorMessage,
  onSuccess
}) => {
  setData({ loading: true, done: false, error: null, ...setDataParams[0] ? setDataParams[0] : [] })
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    ...fetchparams
  }).then(async (res) => {
    const jsonResponse = await res.json()
    const { err, reason, warning, json,  } = jsonResponse
    console.log({
      err,
      reason,
      warning,
      json,
      status: res.status
    })
    if (res.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: err,
        message: errorMessage || reason,
        ...setDataParams[1] ? setDataParams[1] : []
      })
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!warning,
      message: warning || successMessage || message,
      ...setDataParams[1] ? setDataParams[1] : []
    })
    onSuccess(json)
  })
}