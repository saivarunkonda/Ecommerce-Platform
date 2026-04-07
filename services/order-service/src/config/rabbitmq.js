const amqp = require('amqplib');

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect({
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: process.env.RABBITMQ_PORT || 5672,
      username: process.env.RABBITMQ_USER || 'admin',
      password: process.env.RABBITMQ_PASSWORD || 'password'
    });

    channel = await connection.createChannel();

    // Declare queues
    await channel.assertQueue('order_created', { durable: true });
    await channel.assertQueue('payment_processed', { durable: true });
    await channel.assertQueue('order_shipped', { durable: true });
    await channel.assertQueue('notifications', { durable: true });

    console.log('Connected to RabbitMQ');

    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    console.warn('Application will continue without RabbitMQ messaging');
  }
};

const publishMessage = async (queue, message) => {
  try {
    if (!channel) {
      console.warn('RabbitMQ channel not available');
      return;
    }

    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });

    console.log(`Message published to ${queue}:`, message);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
};

const consumeMessage = async (queue, handler) => {
  try {
    if (!channel) {
      console.warn('RabbitMQ channel not available');
      return;
    }

    await channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, true);
        }
      }
    });

    console.log(`Consuming messages from ${queue}`);
  } catch (error) {
    console.error('Error consuming message:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  publishMessage,
  consumeMessage
};
