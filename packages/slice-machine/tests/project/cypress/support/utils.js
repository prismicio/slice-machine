export function randomString(length = 7) {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length); 
}

export function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function randomPascalCase() {
  return [randomString(), randomString()].map(capitalizeFirstChar).join('')
}

export function randomKebabCase() {
  return [randomString(), randomString()].join('-')
}

export function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
