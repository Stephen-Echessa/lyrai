"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Alegreya, Alegreya_Sans } from "next/font/google";

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});


export default function UploadMusic() {
  const [spotifyLink, setSpotifyLink] = useState("");
  const [trackId, setTrackId] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  // Return the track ID if the link is a valid Spotify track URL or URI, otherwise return null
  function parseSpotifyLink(link: string) {
    const urlRegex = /open\.spotify\.com\/track\/([A-Za-z0-9_-]+)/i;
    const uriRegex = /spotify:track:([A-Za-z0-9_-]+)/i;
    let m = link.match(urlRegex);
    if (m && m[1]) return m[1];
    m = link.match(uriRegex);
    if (m && m[1]) return m[1];
    return null;
  }

  // Fetch the oEmbed data from Spotify to get the thumbnail URL for the track (cover art)
  async function fetchOEmbed(spotifyUrl: string) {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.thumbnail_url as string | null;
    } catch (err) {
      return null;
    }
  }

  // Handle the parse and validation of the Spotify link when the user clicks "Analyze"
  async function handleParse() {
    const id = parseSpotifyLink(spotifyLink.trim());
    setTrackId(id);
    setMessage(null);
    if (id) {
      const thumb = await fetchOEmbed(spotifyLink.trim());
      setThumbnail(thumb);
      // indicate success (green border) then navigate to chat page and pass the spotify link so the chat can load it
      setStatus('success');
      router.push(`/chat?spotify=${encodeURIComponent(spotifyLink.trim())}`);
    } else {
      setThumbnail(null);
      setStatus('error');
      setMessage("Please paste a valid Spotify track URL (e.g. open.spotify.com/track/...).");
    }
  }

  return (
    <div className={alegreya.className + " w-full px-2 py-16"}>
      <h1 className="text-3xl md:text-4xl font-bold text-[#593720] mb-4">Please upload your song</h1>
      <p className={alegreyaSans.className + " text-[#593720] mb-2 text-lg font-medium"}>Paste your Spotify track link here</p>

      <div className={alegreyaSans.className + " mb-2"}>
        <div>
          <input
            value={spotifyLink}
            onChange={(e) => { setSpotifyLink(e.target.value); setStatus('idle'); setMessage(null); }}
            placeholder="https://open.spotify.com/track/..."
            className="w-full px-4 py-3 rounded-lg bg-transparent text-[#593720] placeholder-[#a07850] focus:outline-none focus:ring-1 text-lg"
            style={{ border: `1px solid ${status === 'success' ? 'green' : status === 'error' ? 'red' : '#593720'}`, boxShadow: status === 'success' ? '0 0 0 3px rgba(34,197,94,0.08)' : status === 'error' ? '0 0 0 3px rgba(239,68,68,0.08)' : undefined }}
          />
          {message && <div className="mt-4 text-lg text-red-600">{message}</div>}
          <div className={alegreyaSans.className + " mt-4"}>
            <button
              onClick={handleParse}
              disabled={!spotifyLink.trim()}
              className="text-lg w-full px-4 py-3 rounded-lg bg-[#593720] text-[#FFF1D6] font-bold hover:bg-[#4a2d1a] disabled:opacity-50 transition-colors cursor-pointer mt-4"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>

      <div className= "mt-8 text-[14px] md:text-[16px] text-[#856149] text-left font-light">
        Please note: This interface only accepts Spotify links for now.
      </div>
    </div>
  );
}
