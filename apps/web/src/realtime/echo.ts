import Echo from "laravel-echo";
import Pusher from "pusher-js";

export function makeEcho() {
  (window as any).Pusher = Pusher;

  const key = import.meta.env.VITE_PUSHER_KEY ?? "elelang_key";
  const host = import.meta.env.VITE_WS_HOST ?? "localhost";
  const port = Number(import.meta.env.VITE_WS_PORT ?? "6001");
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER ?? import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1";

  return new Echo({
    broadcaster: "pusher",
    key,
    cluster,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
  });
}
