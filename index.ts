import { Tedis } from 'tedis';

const PORT = 6379;
const HOST = '127.0.0.1';

enum Color {
  RED = 'Red',
  GREEN = 'Green',
  YELLOW = 'Yellow',
  BLACK = 'Black',
  ORANGE = 'Orange',
  WHITE = 'White',
  PURPLE = 'Purple',
  PINK = 'Pink',
  BLUE = 'Blue',
  GRAY = 'Gray',
}

const NR_OF_COLORS = Object.keys(Color).length;
const NR_OF_KEYS = 500;

let tedis: Tedis;

const getRandomColor = (): string => Object.values(Color)[Math.floor(Math.random() * NR_OF_COLORS)];

const generateKeys = (): Record<string, string> => {
  const keys: Record<string, string> = {};

  for (let i = 0; i < NR_OF_KEYS; i++) {
    keys[`key_${i}`] = getRandomColor();
  }

  return keys;
};

const print = async (values?: string[]) => {
  if (values) {
    return console.log(values);
  }

  const keys: string[] = [];
  for (let i = 0; i < NR_OF_KEYS; i++) {
    keys.push(`key_${i}`);
  }

  // @ts-ignore
  values = (await tedis.mget(...keys))

  console.log(values?.map((value, i) => `key_${i} - ${value}`));
};

const initTedis = async () => {
  tedis = new Tedis({
    port: PORT,
    host: HOST,
  });
};

const closeTedis = async () => {
  tedis.close();
};

const setKeys = async () => {
  console.log('\nGenerating keys - 500 keys');

  await tedis.mset(generateKeys());
  await print();
};

const changeKeys = async () => {
  console.log('\nChanging keys - every 5th key');

  for (let i = 0; i < NR_OF_KEYS; i += 5) {
    const oldValue = await tedis.get(`key_${i}`) as string;
    await tedis.setrange(`key_${i}`, 2, `___${oldValue.slice(2)}`);
  }
  await print();
};

const getKeys = async () => {
  console.log('\nRetrieving key values - every 2nd key of the first 50 keys');

  const keys: string[] = [];
  for (let i = 0; i < 50; i += 2) {
    keys.push(`key_${i}`);
  }

  // @ts-ignore
  const queriedValues = (await tedis.mget(...keys)) as string[]

  await print(queriedValues);
};

const deleteKeys = async () => {
  console.log('\nDeleting keys - every 3rd key');

  const keys: string[] = [];

  for (let i = 0; i < NR_OF_KEYS; i += 3) {
    keys.push(`key_${i}`);
  }

  // @ts-ignore
  await tedis.del(...keys);
  await print();
};

const getKeysLike = async () => {
  console.log('\nRetrieving keys - like "*7*"');

  const queriedKeys = await tedis.keys('*7*');

  await print(queriedKeys);
};

initTedis()
  .then(() => setKeys())
  .then(() => changeKeys())
  .then(() => getKeys())
  .then(() => deleteKeys())
  .then(() => getKeysLike())
  .then(() => closeTedis())
  .catch((e) => console.error(e));
