export const fetchApi = ({
  url,
  fetchparams = { method: 'GET' },
  setData,
  setDataParams = [],
  successMessage,
  errorMessage,
  onSuccess
}) => {
  setData({ loading: true, done: false, error: null, ...setDataParams[0] ? setDataParams : [] })
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    ...fetchparams
  }).then(async (res) => {
    const json = await res.json()
    if (res.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: json.err,
        message: errorMessage || json.reason,
        ...setDataParams[1] ? setDataParams : []
      })
    }
    setData({
      loading: false,
      done: true,
      error: null,
      message: successMessage || json.message,
      ...setDataParams[1] ? setDataParams : []
    })
    onSuccess(json)
  })
}