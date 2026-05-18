# 🚩 Project 01: Basic Banner Storage

Part of **The Redis Learning Journey**.

This project establishes the absolute fundamentals of integrating Redis into a Node.js Express server. It covers basic string operations, existence checks, and key deletion.

---

## 🎯 Learning Objectives
- Initializing a Redis connection using the `ioredis` library.
- Storing flat string data with `SET`.
- Retrieving values with `GET`.
- Performing conditional logic using `EXISTS`.
- Manually removing database records with `DEL`.

---

## ⚙️ Project Setup & Installation

1. Make sure Redis is running (via the root [docker-compose.yaml](file:///c:/Users/aradi/OneDrive/Documents/reddis/docker-compose.yaml)).
2. Navigate to this directory:
   ```bash
   cd 01
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

### 1. Set the Banner Message
- **Route**: `POST /banner`
- **Body**:
  ```json
  {
    "message": "Welcome to our Awesome Store!"
  }
  ```
- **Description**: Stres the message as a string under the key `app:banner`.

### 2. Retrieve the Banner Message
- **Route**: `GET /banner`
- **Response**:
  ```json
  {
    "message": "Welcome to our Awesome Store!"
  }
  ```
- **Description**: Performs a `GET` on `app:banner`. If not found, falls back to `"Hello World!"`.

### 3. Check if Banner Message Exists
- **Route**: `GET /banner/exist`
- **Response**:
  ```json
  {
    "exists": true
  }
  ```
- **Description**: Uses `EXISTS` to check if `app:banner` key is present in memory.

### 4. Delete the Banner Message
- **Route**: `DELETE /banner`
- **Response**:
  ```json
  {
    "success": true
  }
  ```
- **Description**: Deletes the `app:banner` key using `DEL`.
