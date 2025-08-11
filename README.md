# 🚀 Legacy FE Candidate Assignment — Full-Stack (React + Express + Dynamic WaaS + MFA)

This repository contains a small **full-stack** app:

- **Frontend** (Vite + React + TypeScript + MUI)
    * Email + OTP authentication via **Dynamic Labs (WaaS)**
    * **Message signing** with an embedded wallet and server-side **signature verification**
    * **Headless MFA** flow (add device → scan QR → verify OTP → backup codes)
    * Local history of signed messages with persistence
    * Unit tests (Vitest, Testing Library, MSW)

- **Backend** (Express + TypeScript)
    * `POST /verify-signature` that uses ethers to recover the signer from a signature

---

## ✨ Contents

* Prerequisites
* Quick Start
* How It Works
* API Reference
* Testing
* Environment Variables
* Project Structure
* Deployment

---

## 🧠 Prerequisites

* Node.js 18+ (22 recommended)
* npm 8+ (comes with Node)
* A Dynamic Labs account + Environment ID (for WaaS)

---

## Quick Start

### 1. Backend

```bash
cd 
npm install
npm run dev     # starts API on http://localhost:5000
```

### 2. Frontend

#### Stack: Vite, React 19, TypeScript, MUI, Axios, Dynamic Labs SDK(Waas)

```bash
cd frontend
npm install
npm run dev     # starts Vite on http://127.0.0.1:3000
```

Before the frontend running, you should set your dynamic environment variable in env file.

---

## How It Works

### 1. Auth & Wallet

- Users authenticate via email + OTP using Dynamic Labs.
- An embedded wallet (WaaS) is available via Dynamic SDK.

### 2. Sign & Verify

- In the MessageForm, the app asks the embedded wallet to `signMessage(message)`.

- It sends `{ message, signature }` to `POST /verify-signature`.

- The backend uses `ethers.verifyMessage(message, signature)` to recover the signer.

### 3. MFA (Headless)

- Add device: `useMfa().addDevice()` returns an `otpauth://` URI + `secret`.

- Scan QR: Rendered via `qrcode` to a `<canvas>`.

- Verify OTP: `useMfa().authenticateDevice({ code })`, then show backup codes.

- Acknowledge: `useMfa().completeAcknowledgement()` after saving codes.

### 4. History

- Successful verifications are stored in `localStorage` and listed in the UI.

---

## API Reference

`POST /verify-signature`

- URL: `http://localhost:5000/verify-signature`

- Body (JSON):

```json
{ "message": "hello", "signature": "0x..." }
```

- Success (200):

```json
{
  "isValid": true,
  "signer": "0xABCDEF1234...",
  "originalMessage": "hello"
}
```

- Error (400):

```json
{ "isValid": false, "error": "Invalid signature" }
```

---

## Testing
### Frontend
#### Unit (Vitest + Testing Library + MSW)

```bash
cd frontend
npm test
```

What's covered:

- Auth (send OTP, verify OTP, logout, user info)
- MessageForm (sign, verify, error paths)
- History (rendering)

### Backend

The provided package.json includes Jest + Supertest.

```bash
cd backend
npm test
```

---

## Environment Variables
### Frontend

- VITE_DYNAMIC_ENV_ID - required, your Dynamic Labs Environment ID

### Backend

- PORT - optional (default 5000)

---

## 📁 Project Structure

```
Web3 Message Signer & Verifier/
├── backend/
│   ├── src/
│   ├── routes/
│   ├── tests/
│   ├── app.ts
│   ├── server.ts
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── test/
│   │   ├── App.js
│   │   └── index.js
└── README.md
```

### 4. Deployment

- Frontend:  Deploy on Vercel
- Backend: Deploy on Render