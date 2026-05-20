import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');



app.post("/post/:id/view", async (req, res) => {
  const { id } = req.params;
  const key = `post:${id}:views`;

  const views = await client.incr(key);

  res.json({ postId: id, views });
});

app.post("/leaderboard/score", async (req, res) => {
  const { userId, points } = req.body;

  if (!userId || points === undefined) {
    return res.status(400).json({ error: "userId and points are required" });
  }

  const newScore = await client.zincrby("leaderboard", points, String(userId));

  res.json({ userId, newScore: Number(newScore) });
});

app.get("/leaderboard", async (req, res) => {
  const results = await client.zrevrange("leaderboard", 0, 9, "WITHSCORES");

  const leaders = [];
  for (let i = 0; i < results.length; i += 2) {
    leaders.push({
      rank: Math.floor(i / 2) + 1,
      userId: results[i],
      score: Number(results[i + 1]),
    });
  }

  res.json({ leaders });
});

app.get("/leaderboard/:userId/rank", async (req, res) => {
  const { userId } = req.params;

  const rankRaw = await client.zrevrank("leaderboard", userId);

  if (rankRaw === null) {
    return res.status(404).json({ error: "User not found in leaderboard" });
  }

  const score = await client.zscore("leaderboard", userId);

  res.json({
    userId,
    rank: rankRaw + 1,
    score: Number(score),
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
