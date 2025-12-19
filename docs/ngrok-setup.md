# ngrok Setup Guide

Local webhook testing with ngrok for Retell AI integration.

---

## Installation

```bash
brew install ngrok/ngrok/ngrok
```

Or download from: https://ngrok.com/download

---

## Setup

### 1. Create ngrok Account (Optional but Recommended)

1. Go to https://ngrok.com
2. Sign up for free account
3. Get your auth token from dashboard
4. Configure:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

---

## Usage

### 1. Start Next.js App

```bash
npm run dev
```

App runs on `http://localhost:3000`

### 2. Start ngrok (New Terminal)

```bash
ngrok http 3000
```

### 3. Copy Public URL

ngrok will display:

```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

Your webhook URL is:
```
https://abc123.ngrok-free.app/api/webhooks/retell
```

---

## Register Webhook in Retell

1. Go to https://app.retellai.com
2. Navigate to Settings → Webhooks
3. Paste your ngrok URL:
   ```
   https://abc123.ngrok-free.app/api/webhooks/retell
   ```
4. Save

---

## Important URLs

| URL | Purpose |
|-----|---------|
| `ngrok http 3000` | Command to start ngrok tunnel (points to your Next.js app) |
| `https://abc123.ngrok-free.app` | Public URL for webhooks (register this in Retell) |
| `http://127.0.0.1:4040` | Local ngrok dashboard to monitor requests (debug tool) |

---

## Monitor Requests

### ngrok Web Interface (Debug Dashboard)

Open in browser:
```
http://127.0.0.1:4040
```

This is a **local dashboard** to monitor all requests coming through ngrok. It shows:
- All incoming requests
- Request/response headers
- Request/response body
- Response time

**Note:** This URL is only for debugging, not for webhooks.

### Terminal Logs

Watch Next.js terminal for:
```
✅ Call saved: [call_id]
```

---

## Testing Workflow

1. Start `npm run dev`
2. Start `ngrok http 3000`
3. Register ngrok URL in Retell dashboard
4. Make a test call in Retell
5. Watch logs in:
   - Next.js terminal
   - ngrok web interface (http://127.0.0.1:4040)
6. Check database in Supabase or Drizzle Studio

---

## Common Issues

### URL Changes on Restart

Free ngrok accounts get a new URL each time you restart ngrok.

**Solution:** Update the webhook URL in Retell dashboard after each restart.

**Or:** Upgrade to ngrok paid plan for static URLs.

### Connection Refused

If you see connection errors:

1. Make sure Next.js is running on port 3000
2. Check if another process is using port 3000:
   ```bash
   lsof -i :3000
   ```

### Webhook Not Received

1. Check ngrok web interface for incoming requests
2. Verify URL is correct in Retell dashboard
3. Check if signature validation is failing (401 error)

---

## Reference

- [ngrok Documentation](https://ngrok.com/docs)
- [Retell Register Webhook](https://docs.retellai.com/features/register-webhook) - Official guide for webhook setup with ngrok
