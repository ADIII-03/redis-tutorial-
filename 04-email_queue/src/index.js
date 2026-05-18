import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});