const API_KEY =
  "4afb0518d5d1953fbc80d99670295d1a256c42d4432852c4b27e0ef762272587";
const AGGREGATE_INDEX = "5";

const coins = new Map();
const socket = new WebSocket(
  "wss://streamer.cryptocompare.com/v2?api_key=" + API_KEY
);

socket.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX) {
    return;
  }
  if (price) {
    const handlers = coins.get(currency) ?? [];
    const correctedPrice = price > 1 ? price.toFixed(2) : price.toPrecision(2);
    handlers.forEach((f) => f(correctedPrice));
  }
});
const sendToWS = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};
const subscribeToCoinWS = (coin) => {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
const unsubscribeFromCoinWS = (coin) => {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
export const subscribeToCoin = (coin, cb) => {
  const subscribers = coins.get(coin.toUpperCase()) || [];
  coins.set(coin.toUpperCase(), [...subscribers, cb]);
  subscribeToCoinWS(coin.toUpperCase());
};

export const unsubscribeFromCoin = (coin) => {
  coins.delete(coin.toUpperCase());
  unsubscribeFromCoinWS(coin.toUpperCase());
};
export const getAvailableCoins = async () => {
  return await fetch(
    "https://min-api.cryptocompare.com/data/blockchain/list?" +
      new URLSearchParams({ api_key: API_KEY })
  )
    .then((response) => response.json())
    .then((data) => Object.keys(data.Data));
};

// const loadCoins = () => {
//   if (coins.size === 0) {
//     return;
//   }
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?` +
//       new URLSearchParams({
//         fsyms: [...coins.keys()].join(","),
//         tsyms: "USD",
//         api_key: API_KEY,
//       })
//   )
//     .then((r) => r.json())
//     .then((rawData) => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       );
//       Object.entries(updatedPrices).forEach(([currency, price]) => {
//         const handlers = coins.get(currency) ?? [];
//         const correctedPrice =
//           price > 1 ? price.toFixed(2) : price.toPrecision(2);
//         handlers.forEach((f) => f(correctedPrice));
//       });
//     });
// };
// setInterval(loadCoins, 5000);
