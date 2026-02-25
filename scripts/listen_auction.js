const Pusher = require("pusher-js/node");

const auctionId = process.argv[2];
if (!auctionId) {
  console.error("Usage: node scripts/listen_auction.js <auctionId>");
  process.exit(1);
}

const key = process.env.PUSHER_KEY || "elelang_key";
const host = process.env.WS_HOST || "localhost";
const port = Number(process.env.WS_PORT || "6001");

console.log("Listening:", { auctionId, key, host, port });

const pusher = new Pusher(key, {
  wsHost: host,
  wsPort: port,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws"],
});

const channelName = `auction.${auctionId}`;
const channel = pusher.subscribe(channelName);

channel.bind("pusher:subscription_succeeded", () => {
  console.log("✅ subscribed to", channelName);
});

channel.bind("BidPlaced", (data) => {
  console.log("📣 BidPlaced:", data);
});

channel.bind("AuctionExtended", (data) => {
  console.log("⏱️ AuctionExtended:", data);
});

channel.bind("pusher:subscription_error", (status) => {
  console.log("❌ subscription_error:", status);
});
