import { EachMessagePayload, Kafka, KafkaMessage, Producer } from 'kafkajs';

export interface KfkaOptions {
  cliendId: string;
  brokers: Array<string>;
  otherConfig?: { [k: string]: any };
}

export class Kfka {
  private kafka: Kafka;
  constructor(options: KfkaOptions) {
    this.kafka = new Kafka({
      clientId: options.cliendId,
      brokers: options.brokers,
      ...(options.otherConfig ? options.otherConfig : {}),
    });
    this.createConsumerWithTimeWindow = this.createConsumerWithTimeWindow.bind(this);
  }

  get kafkaInstance() {
    return this.kafka;
  }

  async createProducter() {
    const producer = this.kafka.producer();
    await producer.connect();
  }

  async sendMessage(producer: Producer, topic: string, messagesList: { key: string; value: string; partition: number | undefined }[]) {
    await producer.send({
      topic,
      messages: messagesList,
    });
  }

  async createConsumer(groupName: string, topic: string, onMessage: (message: { topic: string; partition: number; message: string }) => Promise<any>) {
    const consumer = this.kafka.consumer({
      groupId: groupName,
    });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        onMessage({ topic, partition, message: message.value ? message.value.toString() : "" });
      },
    });
    return consumer;
  }

  async createConsumerWithTimeWindow(groupName: string, topic: string, timeWindowSeconds: number, onMessage: (messages: { topic: string; partition: number; message: string }[]) => Promise<any>) {
    const timeWindow = timeWindowSeconds * 1000;
    let flushTime = Date.now() + timeWindow;
    let messagesBuffer: { topic: string; partition: number; message: string }[] = [];
    return await this.createConsumer(groupName, topic, async (message: { topic: string; partition: number; message: string }) => {
      messagesBuffer.push(message);
      if (Date.now() > flushTime) {
        await onMessage(messagesBuffer);
        messagesBuffer = [];
        flushTime = Date.now() + timeWindow;
      }
    });
  }
}