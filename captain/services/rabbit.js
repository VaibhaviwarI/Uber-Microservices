const amqplib = require('amqplib');
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';

let connection;
let channel;

async function connectToRabbitMQ() {
    try {
        if (!connection) {
            connection = await amqplib.connect(RABBIT_URL);
            console.log("Connected to RabbitMQ");
        }
        
        if (!channel) {
            channel = await connection.createChannel();
            console.log("RabbitMQ channel created");
        }
        
        return channel;
    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        throw err;
    }
}

async function publishToQueue(queueName, message) {
    try {
        const ch = await connectToRabbitMQ();
        await ch.assertQueue(queueName, { durable: true });
        return ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { 
            persistent: true 
        });
    } catch (err) {
        console.error("Error publishing to queue:", err);
        throw err;
    }
}

async function subscribeToQueue(queueName, onMessage) {
    try {
        const ch = await connectToRabbitMQ();
        await ch.assertQueue(queueName, { durable: true });
        await ch.consume(queueName, async (msg) => {
            if (!msg) return;
            try {
                const content = JSON.parse(msg.content.toString());
                await onMessage(content);
                ch.ack(msg);
            } catch (err) {
                console.error("Error processing message:", err);
                ch.nack(msg, false, false);
            }
        });
        console.log(`Subscribed to queue: ${queueName}`);
    } catch (err) {
        console.error("Error subscribing to queue:", err);
        throw err;
    }
}

// For backward compatibility with your app.js
async function connect(queueName, callback) {
    await subscribeToQueue(queueName, callback);
}

module.exports = {
    publishToQueue,
    subscribeToQueue,
    connect,
    connectToRabbitMQ
};