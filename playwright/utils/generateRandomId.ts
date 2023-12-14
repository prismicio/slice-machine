export function generateRandomId() {
  const currentDate = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1e6);
  return `${currentDate}${randomNumber}`;
}
