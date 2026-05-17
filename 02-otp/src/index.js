import express from 'express';  

import Redis from 'ioredis';

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone) {
    return `otp:${phone}`;
}

app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setex(otpKey(phone), 30, otp); 

    res.json({ message: 'OTP has been sent to your phone (check server logs for demo)' , otp });
});

app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const storedOtp = await redis.get(otpKey(phone));

    if(!storedOtp) {
        return res.status(400).json({ error: 'OTP has expired or does not exist' });
    }

    if (storedOtp === otp) {
        await redis.del(otpKey(phone)); 
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

});

app.get('/otp/:phone/ttl', async (req, res) => {
    const { phone } = req.params;
    const ttl = await redis.ttl(otpKey(phone));
    res.json({ phone, ttl });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});