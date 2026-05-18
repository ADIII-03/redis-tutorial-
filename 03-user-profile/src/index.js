import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// ── JSON routes ──────────────────────────────────────────

app.post("/user/:id/json", async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        if (!userData || typeof userData !== 'object') {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        await redis.set(`user:json:${id}`, JSON.stringify(userData));
        res.json({ message: 'User data stored successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/user/:id/json", async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await redis.get(`user:json:${id}`);

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(JSON.parse(userData));
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Hash routes ──────────────────────────────────────────

app.post("/user/:id/hash", async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        if (!userData || typeof userData !== 'object') {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        await redis.hmset(`user:hash:${id}`, userData);
        res.json({ message: 'User data stored successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/user/:id/hash", async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await redis.hgetall(`user:hash:${id}`);

        if (!userData || Object.keys(userData).length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});