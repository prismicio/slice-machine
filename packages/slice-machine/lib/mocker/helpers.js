export const canParse = (str) => {
  try {
    const json = JSON.parse(str)
    return true
  } catch(e) {

    return false
  }
}