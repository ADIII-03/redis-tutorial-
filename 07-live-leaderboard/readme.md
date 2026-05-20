# Live Leaderboard with Redis

This project demonstrates how to build a live leaderboard and basic page view counter using Redis and Node.js (Express).

## Redis Concepts & Commands Used

### 1. `INCR`
Used to atomically increment a key by 1. 
- **Endpoint:** `POST /post/:id/view`
- **Pattern:** `post:<id>:views`
- **Usage in code:** `client.incr(key)`
If the key doesn't exist, Redis creates it at 0 and then increments it to 1. This is perfect for counting views, likes, or other basic counters.

### 2. `ZINCRBY` (from Sorted Sets)
Used to increment the score of a member in a sorted set.
- **Endpoint:** `POST /leaderboard/score`
- **Pattern:** `leaderboard`
- **Usage in code:** `client.zincrby("leaderboard", points, String(userId))`
Sorted sets are ideal for leaderboards because they automatically keep elements ordered by their scores. `ZINCRBY` allows adding points (or subtracting if negative) for a specific user.

### 3. `ZREVRANGE`
Used to get a range of members in a sorted set, from highest score to lowest.
- **Endpoint:** `GET /leaderboard`
- **Usage in code:** `client.zrevrange("leaderboard", 0, 9, "WITHSCORES")`
This retrieves the top 10 users. The `WITHSCORES` option includes the scores along with the member names, which is necessary to display both rank and points.

### 4. `ZREVRANK`
Used to get the rank of a member in a sorted set, ordered from highest to lowest score.
- **Endpoint:** `GET /leaderboard/:userId/rank`
- **Usage in code:** `client.zrevrank("leaderboard", userId)`
This efficiently finds a specific user's position in the leaderboard. It returns a 0-based index (0 is 1st place), so you typically add 1 for display purposes.

### 5. `ZSCORE`
Used to get the score of a specific member in a sorted set.
- **Endpoint:** `GET /leaderboard/:userId/rank`
- **Usage in code:** `client.zscore("leaderboard", userId)`
Fetches the current score for the user to display alongside their rank.

## Why Use Redis for Leaderboards? (Behind the Scenes)

When building a leaderboard in a traditional relational database (like SQL), calculating ranks and ordering thousands of users usually requires executing expensive `ORDER BY` queries. As the dataset grows, sorting scores in real-time on every request becomes extremely slow and computationally heavy.

### The Benefits of Redis
1. **In-Memory Speed:** Redis stores all data in RAM, making read and write operations incredibly fast (often completing in sub-millisecond times).
2. **Built-in Data Structures:** Instead of simple tables, Redis offers advanced data structures like **Sorted Sets (`ZSET`)** which are specifically engineered for ranking problems.
3. **Atomic Operations:** Commands like `INCR` and `ZINCRBY` are atomic. This means if thousands of users view a post or gain points at the exact same millisecond, Redis processes them sequentially behind the scenes without any race conditions or data loss.

### How Does Redis "Auto-Update" the Leaderboard?

The magic behind the live leaderboard is the **Sorted Set** data structure (used via `ZADD`, `ZINCRBY`, `ZREVRANGE`, etc.).

Behind the scenes, a Sorted Set is implemented using a combination of a **hash table** (to map members to their scores for instant lookups, like `ZSCORE`) and a **Skip List** (a multi-layered linked list that keeps the elements perfectly ordered by their score). 

When you call `client.zincrby("leaderboard", points, userId)`:
1. Redis looks up the user's current score in the hash table.
2. It updates the score.
3. It instantly repositions the user in the Skip List to maintain the correct sorted order. 

Because of this Skip List architecture, the leaderboard is **always pre-sorted**. When you call `ZREVRANGE` to get the top 10 players, Redis doesn't have to sort the entire table; it just grabs the top 10 elements from the end of the Skip List. This is how Redis effortlessly "auto-updates" and maintains live rankings for millions of users with zero lag!

## How to Run

1. Make sure you have Redis running (default: `localhost:6379`).
2. Install dependencies: `npm install` (or `bun install`).
3. Start the server: `node src/index.js` (or `bun run src/index.js`).
4. The API will be available at `http://localhost:3000`.
