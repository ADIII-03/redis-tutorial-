# 🔑 Project 02-otp: Temporary OTP Engine

Part of **The Redis Learning Journey**.

This project implements a practical verification engine using **Time-to-Live (TTL)** and **Volatile Keys**. It models a real-world One-Time Password (OTP) validation workflow.

---

## 🎯 Learning Objectives
- Understanding the difference between volatile keys and persistent keys.
- Implementing atomic set-with-expiration commands using `SETEX`.
- Checking remaining life of volatile keys using `TTL`.
- Creating clean, secure verification logic that prevents replay attacks by immediately removing OTPs upon successful verification.

---

## ⚙️ Project Setup & Installation

1. Ensure the Redis docker container is running.
2. Navigate to this directory:
   ```bash
   cd 02-otp
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

### 1. Request a new OTP
- **Route**: `POST /otp`
- **Body**:
  ```json
  {
    "phone": "+1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "message": "OTP has been sent to your phone (check server logs for demo)",
    "otp": "482019"
  }
  ```
- **Description**: Generates a random 6-digit code and stores it in Redis under `otp:+1234567890` with a 30-second TTL using `SETEX`.

### 2. Verify OTP
- **Route**: `POST /otp/verify`
- **Body**:
  ```json
  {
    "phone": "+1234567890",
    "otp": "482019"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully"
  }
  ```
- **Failure / Expired Response (400 Bad Request)**:
  ```json
  {
    "error": "OTP has expired or does not exist"
  }
  ```
- **Description**: Compares the user-supplied OTP with the one stored in Redis. On success, it calls `DEL` immediately to avoid replay attacks.

### 3. Check remaining TTL
- **Route**: `GET /otp/:phone/ttl`
- **Response**:
  ```json
  {
    "phone": "+1234567890",
    "ttl": 18
  }
  ```
- **Description**: Returns the remaining seconds before the OTP is automatically evicted by Redis using the `TTL` command.
