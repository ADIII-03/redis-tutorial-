# 📢 Project 06: Real-Time Messaging with Redis Pub/Sub

Part of **The Redis Learning Journey**.

This project implements a lightweight, real-time messaging pipeline using the **Redis Publish/Subscribe (Pub/Sub)** pattern. It decouples the application by allowing an API server (Publisher) to broadcast events to a standalone background service (Subscriber) without either of them needing direct knowledge of the other.

---

## 🎯 Learning Objectives
- Understanding the Publish/Subscribe (Pub/Sub) pattern and message distribution.
- Implementing a Redis **Publisher** inside an Express REST API to broadcast event payloads.
- Implementing a standalone Redis **Subscriber** process to consume messages on a channel.
- Distinguishing between **At-Most-Once** (Pub/Sub) and **At-Least-Once** (Message Queues) delivery semantics.
- Discovering how to run, scale, and test real-time pub/sub pipelines in development and production.

---

## ⚙️ How it Works Under the Hood

Unlike traditional message queues (like BullMQ or RabbitMQ) where messages are stored in a database/list until a worker pulls them, Redis Pub/Sub uses a **fire-and-forget** push mechanism. 

```mermaid
flowchart TD
    Client[Client / Postman] -- 1. POST /notification --> Publisher[Express Server (Publisher)]
    Publisher -- 2. PUBLISH notifications <payload> --> Redis[(Redis Server)]
    Redis -- 3. Broadcast Event (Push) --> Subscriber1[Subscriber Process]
    Redis -- 3. Broadcast Event (Push) --> Subscriber2[Subscriber Process (Horizontal Scaled)]
    
    style Redis fill:#ffdddd,stroke:#ff5555,stroke-width:2px
    style Subscriber1 fill:#ddffdd,stroke:#55ff55,stroke-width:2px
    style Subscriber2 fill:#ddffdd,stroke:#55ff55,stroke-width:2px
```

1. **Client** hits the `/notification` endpoint on the Express server (Publisher) with a title and body.
2. **Publisher** formats the message into a JSON string and uses the Redis `PUBLISH` command to send it to the `'notifications'` channel.
3. **Redis** instantly duplicates and routes this message to all connected clients that have registered interest using the `SUBSCRIBE` command on that channel.
4. **Subscriber(s)** immediately receive the event payload pushed by Redis and log it to their console.

---

## ⚙️ Project Setup & Installation

1. Ensure your Redis Docker container is running:
   ```bash
   # Run the container defined in the workspace root
   docker compose up -d redis
   ```
2. Navigate to this directory:
   ```bash
   cd 06-pub_sub
   ```
3. Install dependencies:
   ```bash
   npm install
   # or using Bun
   bun install
   ```

### Running the Services

Because Pub/Sub relies on real-time listening, you must run both services in separate terminal windows:

- **Terminal 1: Start the Subscriber (Listener)**
  ```bash
  npm run subscriber
  # or
  bun run src/subscriber.js
  ```
  *(You should see `Subscribed successfully!` printed in the console)*

- **Terminal 2: Start the Express API (Publisher)**
  ```bash
  npm run dev
  # or
  bun run src/index.js
  ```
  *(Starts the Express server on port 3000)*

---

## 🧪 Testing with Postman

Since the Publisher exposes a standard HTTP REST endpoint, you can easily trigger and test the entire pub/sub cycle using Postman.

### Step-by-Step Instructions

1. **Open Postman** and create a new request.
2. Set the HTTP request method to **`POST`**.
3. Enter the URL:
   ```text
   http://localhost:3000/notification
   ```
4. Click on the **Body** tab, select **raw**, and set the format dropdown to **JSON**.
5. Paste the following JSON payload:
   ```json
   {
     "title": "System Alert",
     "body": "Redis Pub/Sub is running smoothly in our local environment!"
   }
   ```
6. Click the **Send** button.

### What to Expect

- **Postman Response**: You will receive a `200 OK` response with:
  ```json
  {
    "message": "Message published successfully"
  }
  ```
- **Subscriber Terminal Logs**: Switch to the terminal where you ran `npm run subscriber`. You will immediately see the broadcasted message logged in real-time:
  ```text
  Received message from notifications: {"title":"System Alert","body":"Redis Pub/Sub is running smoothly in our local environment!","createdAt":"2026-05-20T01:38:00.000Z"}
  ```

---

## 🏭 Redis Pub/Sub in Production

While Redis Pub/Sub is exceptionally fast and simple, it has unique behaviors that make it suitable for specific production architectures and unsuitable for others.

### 1. Delivery Guarantees: Fire-and-Forget
* **At-Most-Once Delivery**: Redis Pub/Sub does not persist messages. If a subscriber goes offline (even for a split second) and a publisher sends a message, that message is **lost forever** for that subscriber.
* **No Acknowledgment (ACK)**: The publisher does not receive any notification of whether a subscriber successfully processed a message or if anyone was listening at all.

### 2. When to Use Pub/Sub vs. Queues (e.g., BullMQ)

| Feature | Redis Pub/Sub (`06-pub_sub`) | Message Queues / BullMQ (`05-bullmq`) |
| :--- | :--- | :--- |
| **Delivery Model** | Push (Real-time Broadcast) | Pull (Worker Polling) |
| **Data Persistence** | None (In-memory, transient) | High (Stored in Redis until processed) |
| **Offline Support** | No (Messages are lost if offline) | Yes (Jobs wait in the queue) |
| **Scaling** | All active subscribers get all messages | Jobs are distributed/balanced among workers |
| **Use Cases** | Chat apps, Live dashboards, WebSocket sync | Email senders, Video transcoding, PDF generation |

### 3. Production Use Cases for Pub/Sub
* **WebSocket Horizontal Scaling**: In a multi-server setup, if User A is connected to Server 1 and User B is connected to Server 2, Server 1 can publish User A's chat message to Redis Pub/Sub, and Server 2 (subscribed to the channel) will receive it and push it to User B via WebSocket.
* **Cache Invalidation**: Broadcasting updates to all server instances so they can invalidate or refresh their local in-memory caches.
* **Real-time Notifications**: Triggering transient notifications where real-time speed is critical and minor packet loss is non-blocking.

### 4. Best Practices for Production
* **Separate Connections**: A Redis client instance that calls `SUBSCRIBE` or `PSUBSCRIBE` enters a "subscriber state" and **cannot** run other commands (like `GET`, `SET`, or `PUBLISH`). In production, always maintain separate Redis client instances for publishing and subscribing.
* **Monitor Connection Drops**: Since disconnected subscribers miss messages, implement a fallback mechanism (such as checking a database or using Redis Streams) to fetch missed state changes upon reconnection.
* **Channel Naming Conventions**: Use structured namespaces for channels (e.g., `app:tenant:user_id:events`) to avoid collision and make subscriptions more granular.
