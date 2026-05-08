# Lyr.AI Frontend

The Next.js frontend for Lyr.AI, a music analysis chatbot. Paste a Spotify track link and start a conversation about the song.

## Prerequisites

- Node.js 18+
- The Lyr.AI chatbot backend running locally or deployed
- A Spotify app registered at [developer.spotify.com](https://developer.spotify.com)

## Setup

1. Clone the repository

```bash
git clone https://github.com/Stephen-Echessa/lyrai
cd lyrai
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://27.0.0.1/chat
```

4. Run the development server

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

## Usage

1. Make sure the chatbot backend is running at `http://localhost:8000`
2. Open `http://localhost:3000` in your browser
3. Navigate to the chat page
4. Paste a Spotify track link into the sidebar and click Analyze
5. Ask anything about the track

## Deployment

The frontend is deployed on Vercel. To deploy your own instance:

```bash
npm install -g vercel
vercel
```

Add the following environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_WS_URL=wss://your-backend-url
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-vercel-url/chat
```
