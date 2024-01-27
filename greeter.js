export default async function greeter ({ name }, task) {
    const { resolve, reject, postMessage } = task;
    if (!name) reject('no name provided');
    postMessage(`Hello ${name}!`);
    resolve('done');
}

export const nextBirthday = async function ({ name, month, day }, task) {
  const { resolve, reject, postMessage } = task;
  if (!name) reject("no name provided");
  if (!month) reject("no month provided");
  if (!day) reject("no day provided");
  const nextBirthday = new Date();
  nextBirthday.setMonth(month - 1);
  nextBirthday.setDate(day);
  const today = new Date();
  if (nextBirthday < today) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );
  postMessage(`Hello ${name}! Your birthday is in ${daysUntilBirthday} days!`);
  resolve("done");
};
