import {Worker} from 'bullmq';
import { emailQueue, connection } from './queue.js';

const worker = new Worker(emailQueue.name, async job => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Job ${job.id} completed`);
}, { connection });


worker.on('completed', job => {
    console.log(`Job ${job.id} has been completed`);
}
);

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} has failed with error:`, err);
}
);

