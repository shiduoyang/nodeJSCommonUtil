import amqplib from 'amqplib';

class RabbitMqUtil {

  async getConnection(url: string, options?: any): Promise<amqplib.Connection>{
    return amqplib.connect(url, options);
  }

  async createChannelToRead(conn: amqplib.Connection, queueName: string, handleWhenReceiveMessage: (msg: string) => Promise<void>) {
    const ch = await conn.createChannel();
    await ch.assertQueue(queueName);

      // Listener
    ch.consume(queueName, (msg: any) => {
      if (msg !== null) {
        // console.log('Received:', msg.content.toString());
        handleWhenReceiveMessage(msg.content.toString());
        ch.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
    });
  }

  async createChannelToWrite(conn: amqplib.Connection, queueName: string) {
    // Sender
    const ch = await conn.createChannel();
  
    return async function (content: string) {
      ch.sendToQueue(queueName, Buffer.from(content));    
    }
  }

}

export const rabbitMqUtil = new RabbitMqUtil();

// (async () => {
//   const queue = 'tasks';
//   const conn = await amqplib.connect('amqp://localhost');

//   const ch1 = await conn.createChannel();
//   await ch1.assertQueue(queue);

//   // Listener
//   ch1.consume(queue, (msg: any) => {
//     if (msg !== null) {
//       console.log('Received:', msg.content.toString());
//       ch1.ack(msg);
//     } else {
//       console.log('Consumer cancelled by server');
//     }
//   });

//   // Sender
//   const ch2 = await conn.createChannel();

//   setInterval(() => {
//     ch2.sendToQueue(queue, Buffer.from('something to do'));
//   }, 1000);
// })();
