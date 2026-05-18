# 👤 Project 03: Structured User Profiles (JSON vs. Hashes)

Part of **The Redis Learning Journey**.

This project explores two methods for storing complex structured objects in Redis: serializing the objects to flat JSON strings, and using Redis's native **Hash** data type.

---

## 🎯 Learning Objectives
- Storing structured data by serializing objects to JSON strings (`SET`/`GET`).
- Storing structured data natively using Redis Hashes (`HMSET`/`HGETALL`).
- Comparing the performance, use cases, and trade-offs of both storage paradigms.

---

## ⚙️ Project Setup & Installation

1. Ensure the Redis docker container is running.
2. Navigate to this directory:
   ```bash
   cd 03-user-profile
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

---

## 🛣️ API Endpoints

The server runs on **port 3000** and provides the following routes:

### ── Method A: JSON String Storage ──

#### 1. Save User Profile as JSON String
- **Route**: `POST /user/:id/json`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "administrator",
    "status": "active"
  }
  ```
- **Description**: Stringifies the request body and stores it using `SET` under `user:json:<id>`.

#### 2. Get User Profile as JSON
- **Route**: `GET /user/:id/json`
- **Response**: The complete user object parsed back into JSON.
- **Description**: Fetches the string via `GET` and deserializes it.

---

### ── Method B: Native Redis Hash ──

#### 1. Save User Profile as a Hash
- **Route**: `POST /user/:id/hash`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "developer"
  }
  ```
- **Description**: Stores the fields directly into a Redis Hash using `HMSET` under `user:hash:<id>`.

#### 2. Get User Profile Hash
- **Route**: `GET /user/:id/hash`
- **Response**: An object representing all field-value pairs in the Hash.
- **Description**: Fetches the fields natively using `HGETALL`.

---

## ⚖️ Trade-offs: JSON Strings vs. Hashes

| Feature | JSON String (`SET` / `GET`) | Redis Hash (`HMSET` / `HGETALL`) |
| :--- | :--- | :--- |
| **Object Nesting** | Supports highly nested objects natively. | Best for flat key-value representations. |
| **Serialization Overhead**| Requires CPU-intensive stringification and parsing. | Direct, high-performance binary storage of fields. |
| **Partial Updates** | Must read the entire string, parse, modify, stringify, and write it back. | Can update a single field instantly using `HSET` without touching other fields. |
| **Bandwidth Efficiency** | Low if you only need a single field (must fetch full object). | Extremely high (can fetch specific fields using `HMGET`). |
