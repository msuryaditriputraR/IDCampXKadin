const amqp = require('amqplib');
const config = require('../../utils/config');

class QueueService {
  async sendMessage(queue, message) {
    const connection = await amqp.connect(config.rabbitMq.server);

    connection.on('error', (error) => {
      console.log(error);
    });

    const channel = await connection.createChannel();

    console.log(queue)

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  }
}

module.exports = QueueService;
