import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post('/notification', async (req, res) => {
    const payload = {
        title: req.body.title,
        body: req.body.body,
        createdAt: new Date().toISOString()
    };
    await publisher.publish('notifications', JSON.stringify(payload));
    res.json({ message: 'Message published successfully' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
