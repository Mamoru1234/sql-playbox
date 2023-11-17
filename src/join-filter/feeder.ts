import { Client } from "pg";
import { randomDate, randomNumber, randomText } from "../random.utils";

const BATCH_COUNT = 10000;
const BATCH_SIZE = 10000;

const generateOrder = () => ({
  description: randomText(),
  product: randomText(),
  date: randomDate().toISOString(),
});

const generateTransactionFactory = (orders: string[]) => {
  let currentOrderIndx = 0;
  const nextOrder = () => {
    currentOrderIndx += 1;
    if (currentOrderIndx === orders.length) {
      currentOrderIndx = 0;
    }
    return orders[currentOrderIndx];
  }
  return () => ({
    orderId: nextOrder(),
    description: randomText(),
    date: randomDate().toISOString(),
    amount: randomNumber(10000),
  });
};

const executeTimes = <TReturn>(times: number, factory: () => TReturn): TReturn[] => {
  const result: TReturn[] = []; 
  for (let i = 0; i < times; i++) {
    result.push(factory());
  }
  return result;
}

const insertOrders = async (client: Client, orders: ReturnType<typeof generateOrder>[]): Promise<string[]> => {
  const values = orders.map((it) => `('${it.description}', '${it.product}', '${it.date}')`).join(', ');
  const query = `INSERT INTO orders(description, product, date) VALUES ${values} RETURNING id`;
  const { rows } = await client.query(query);
  return rows.map((it) => it.id);
}

type TTransaction = ReturnType<ReturnType<typeof generateTransactionFactory>>;

const insertTransactions = async (client: Client, transactions: TTransaction[]) => {
  const values = transactions.map((it) => `('${it.description}', '${it.amount}', '${it.orderId}', '${it.date}')`).join(', ');
  const query = `INSERT INTO transactions(description, amount, order_id, date) VALUES ${values}`;
  await client.query(query);
}

async function main(): Promise<void> {
  console.log(new Date(), 'Connecting to DB');
  const client = new Client({
    user: 'postgres',
    password: 'example',
  });
  await client.connect();
  console.log(new Date(), 'Connected to DB');
  try {
    for (let i = 0; i < BATCH_COUNT; i++) {
      console.log(new Date(), 'Generating batch', i);
      const orders = await insertOrders(client, executeTimes(BATCH_SIZE, generateOrder));
      const generateTransaction = generateTransactionFactory(orders);
      await insertTransactions(client, executeTimes(BATCH_SIZE, generateTransaction));
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => console.error('Error in main', e));