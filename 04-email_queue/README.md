# 📧 Project 04: Basic Redis Client Template

Part of **The Redis Learning Journey**.

This folder serves as a clean starting point for setting up basic client connections to Redis, providing standard baseline setups for Express and `ioredis` before implementing advanced queuing libraries.

---

## ⚙️ Project Setup & Installation

1. Ensure the Redis docker container is running.
2. Navigate to this directory:
   ```bash
   cd 04-email_queue
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
   *(or `npm install` depending on your package manager)*
4. Start the server:
   ```bash
   bun run src/index.js
   ```

---

## 🛣️ API Endpoints

The server runs on **port 3000** and serves as a boilerplate for future implementations.
- `src/index.js` connects to a Redis instance using standard `ioredis` Client initialization.
