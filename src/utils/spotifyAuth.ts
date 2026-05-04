const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ");

// Generate a random string for the code verifier
function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Hash the verifier to create the code challenge
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function redirectToSpotifyLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // Save verifier to localStorage — needed when Spotify redirects back
  localStorage.setItem("spotifyCodeVerifier", verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = localStorage.getItem("spotifyCodeVerifier");

  if (!code || !verifier) return null;

  // Clean the code from the URL immediately
  window.history.replaceState(null, "", window.location.pathname + 
    window.location.search.replace(/[?&]code=[^&]+/, "").replace(/^&/, "?")
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem("spotifyToken", data.access_token);
  localStorage.setItem("spotifyRefreshToken", data.refresh_token);
  localStorage.setItem("spotifyTokenExpiresAt", String(expiresAt));
  localStorage.removeItem("spotifyCodeVerifier");

  return data.access_token;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("spotifyRefreshToken");
  if (!refreshToken) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem("spotifyToken", data.access_token);
  localStorage.setItem("spotifyTokenExpiresAt", String(expiresAt));
  if (data.refresh_token) {
    localStorage.setItem("spotifyRefreshToken", data.refresh_token);
  }

  return data.access_token;
}

export async function getSpotifyToken(): Promise<string | null> {
  // Check if Spotify just redirected back with a code
  const params = new URLSearchParams(window.location.search);
  if (params.get("code")) {
    return await exchangeCodeForToken();
  }

  // Check stored token
  const token = localStorage.getItem("spotifyToken");
  const expiresAt = Number(localStorage.getItem("spotifyTokenExpiresAt"));

  if (!token) return null;

  // Token still valid
  if (Date.now() < expiresAt - 60_000) return token;  // 60s buffer

  // Token expired — try to refresh
  return await refreshAccessToken();
}

export function clearSpotifyToken() {
  localStorage.removeItem("spotifyToken");
  localStorage.removeItem("spotifyRefreshToken");
  localStorage.removeItem("spotifyTokenExpiresAt");
  localStorage.removeItem("spotifyCodeVerifier");
}