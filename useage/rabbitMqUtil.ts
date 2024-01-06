
import { rabbitMqUtil } from '../src/queue/rabbitMq';

async function test() {
  const connection = await rabbitMqUtil.getConnection('amqp://localhost');
  if (!connection) {
    return;
  }
  const readChannel = await rabbitMqUtil.createChannelToRead(connection, 'user-stat', async (msg: string) => {
    console.log('realChannel1 received:', msg);
  });
  const readChannel2 = await rabbitMqUtil.createChannelToRead(connection, 'user-stat', async (msg: string) => {
    console.log('realChannel2 received:', msg);
  });

  const writeFunction = await rabbitMqUtil.createChannelToWrite(connection, 'user-stat');
  setInterval(async () => {
    await writeFunction('hello');
  }, 1000);
}
test();