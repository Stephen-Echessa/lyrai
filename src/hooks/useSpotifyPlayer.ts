import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        Spotify: any;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function useSpotifyPlayer(accessToken: string | null) {
    const playerRef = useRef<any>(null)
    const [deviceId, setDeviceId] = useState<string>("")
    const [isReady, setIsReady] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const initPlayer = () => {
            const player = new window.Spotify.Player({
                name: "Lyr.AI Player",
                getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
                volume: 0.8
            })

            player.addListener("ready", ({device_id}:{device_id:string}) => {
                console.log("Spotify Player ready", device_id)
                setDeviceId(device_id)
                setIsReady(true)
                setError(null)
            })

            player.addListener("not_ready", () => {
                setIsReady(false);
            });

            player.addListener("player_state_changed", (state: any) => {
                if (!state) return;
                setIsPlaying(!state.paused);
            });

            player.addListener("authentication_error", () => {
                setError("auth_error");
            });

            player.addListener("account_error", () => {
                setError("premium_required");
            });

            player.connect();
            playerRef.current = player;  
        }      
        
        // SDK may already be loaded or still loading
        if (window.Spotify) {
            initPlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        }

        return () => {
            playerRef.current?.disconnect();
        };
    }, [accessToken]);

    async function playTrack(trackId: string) {
        if (!accessToken || !deviceId) return;

        // Transfer playback to this browser tab
        await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });

        // Play the specific track
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
        });
    }

    async function togglePlay() {
        await playerRef.current?.togglePlay();
    }

    async function disconnect() {
        playerRef.current?.disconnect();
        setIsReady(false);
        setIsPlaying(false);
    } 

    return { isReady, isPlaying, error, playTrack, togglePlay, disconnect };
}
