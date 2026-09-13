# 🚀 AstroBot — NASA Mission Control Slack Bot
> **Hack Club Stardance Summer 2026 Challenge Submission**  
> *Built with Node.js, `@slack/bolt`, Socket Mode, and NASA Open APIs.*

---

## 🌟 Overview

**AstroBot** turns any Slack workspace into an interactive **NASA Mission Control Center**. It connects directly to live NASA data feeds, deep-space telemetry, Mars rovers, orbital radar, and trivia databases to bring space science into team conversations.

---

## ✨ Features & Slash Commands

| Command | Description | Data Source |
|---|---|---|
| **`/astro-apod`** | NASA Astronomy Picture of the Day with HD images & scientific explanations. Supports `random` and specific dates (`YYYY-MM-DD`). | NASA Planetary APOD API |
| **`/astro-neo`** | Real-time Asteroid Radar: scans Near-Earth Objects flying by today with diameter, miss distance (LD & km), and velocity. | NASA JPL NeoWs API |
| **`/astro-mars`** | Explores high-resolution surface photos taken on Mars by Curiosity and Perseverance rovers (filterable by Sol). | NASA Mars Photos API |
| **`/astro-iss`** | Live International Space Station tracking: real-time latitude/longitude coordinates, speed, and list of humans currently in space. | Open Notify / ISS Telemetry |
| **`/astro-quiz`** | Interactive space science trivia game with clickable Slack Block Kit action buttons and immediate answers. | AstroBot Space Bank |
| **`/astro-help`** | Interactive operations manual and command overview. | Internal |

---

## 🛠️ Quick Setup Guide

### 1. Clone & Install Dependencies
```bash
cd stardance-slackbot
npm install
```

### 2. Configure Slack App (1-Click Manifest)
1. Go to **[api.slack.com/apps](https://api.slack.com/apps)** and click **Create New App**.
2. Select **From an app manifest**.
3. Choose your Slack workspace (e.g. Hack Club Slack or your own dev workspace).
4. Copy and paste the contents of `slack-manifest.json` from this repository.
5. Click **Create**!

### 3. Generate Tokens
1. **App-Level Token:** Under *Basic Information* → *App-Level Tokens*, generate a token with the `connections:write` scope (starts with `xapp-`).
2. **Install App:** Go to *Install App* → *Install to Workspace*. Copy your **Bot User OAuth Token** (starts with `xoxb-`).
3. **Signing Secret:** Copy the **Signing Secret** from *Basic Information* → *App Credentials*.

### 4. Set Environment Variables
Create a `.env` file from `.env.example`:
```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
NASA_API_KEY=DEMO_KEY   # or your free key from https://api.nasa.gov/
```

### 5. Run & Test
```bash
# Test API endpoints
npm test

# Start the bot in Socket Mode (no ngrok required!)
npm start
```

---

## 🚀 Deployment (Hack Club Nest / Cloud)

To keep your bot running 24/7 for the Stardance challenge:
1. **Hack Club Nest:** Deploy directly to Nest using your Hack Club account.
2. **Railway / Render / Fly.io:** Push this repo to GitHub, add your environment variables in the dashboard, and deploy!

---

## 🏆 Stardance Rubric Alignment
- **Originality:** Real-time space mission control in Slack with live orbital feeds and rover photos.
- **Technicality:** Built using Slack Block Kit interactive components, Socket Mode async handlers, and multi-stream NASA APIs.
- **Usability:** Rich UI with interactive buttons, fail-safe error handling, and intuitive slash command parameters.
- **Storytelling:** Complete documentation, step-by-step setup guides, and live science trivia feedback.
