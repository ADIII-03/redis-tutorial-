import express from 'express';
import Redis from 'ioredis';
import {emailQueue} from './queue.js';

const app = express();
app.use(express.json());


app.post("/welcome-email", async (req, res) => {
    
const job = await emailQueue.add('sendWelcomeEmail', { email: req.body.email },
    {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    }
);

    res.json({ message: 'Welcome email job has been added to the queue', jobId: job.id });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});