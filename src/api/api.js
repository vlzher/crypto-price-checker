const API_KEY =
  "4afb0518d5d1953fbc80d99670295d1a256c42d4432852c4b27e0ef762272587";
const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";

const coins = new Map();
const coinsValidated = new Map();
const socket = new WebSocket(
  "wss://streamer.cryptocompare.com/v2?api_key=" + API_KEY
);
let BTCUSD = 0;

const addSocketMessageListener = (type, func) => {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.TYPE === type) {
      func(message);
    }
  });
};
const isCorrectCoin = (message) => {
  if (message.MESSAGE === "INVALID_SUB") {
    const data = message.PARAMETER.split("~");
    const coinFrom = data[2];
    const coinTo = data[3];
    if (coinTo === "BTC") {
      coinsValidated.set(coinFrom, false);
      unsubscribeFromCoinWSBTC(coinFrom);
      return;
    }
    unsubscribeFromCoinWSUSD(coinFrom);
    subscribeToCoinWSBTC(coinFrom);
  }
};
const addValidateCoinListenerWS = () => {
  addSocketMessageListener(INVALID_SUB, (message) => {
    isCorrectCoin(message);
  });
};
export const isCoinValid = (coin) => coinsValidated.get(coin) ?? true;
const updateCoin = (message) => {
  const { FROMSYMBOL: currency, PRICE: price, TOSYMBOl: toCurrency } = message;
  if (price) {
    const handlers = coins.get(currency) ?? [];
    let correctedPrice = price;
    if (toCurrency === "BTC") {
      correctedPrice = price * BTCUSD;
    }
    correctedPrice = price > 1 ? price.toFixed(2) : price.toPrecision(2);

    handlers.forEach((f) => f(correctedPrice));
  }
};
const addUpdateCoinListenerWS = () =>
  addSocketMessageListener(AGGREGATE_INDEX, (message) => updateCoin(message));
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

const subscribeToCoinWSBTC = (coin) => {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${coin}~BTC`],
  });
};
const unsubscribeFromCoinWSBTC = (coin) => {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${coin}~BTC`],
  });
};
const subscribeToCoinWSUSD = (coin) => {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
const unsubscribeFromCoinWSUSD = (coin) => {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
export const subscribeToCoin = (coin, cb) => {
  const subscribers = coins.get(coin.toUpperCase()) || [];
  coins.set(coin.toUpperCase(), [...subscribers, cb]);
  subscribeToCoinWSUSD(coin.toUpperCase());
  isCoinValid(coin.toUpperCase());
};

export const unsubscribeFromCoin = (coin) => {
  coins.delete(coin.toUpperCase());
  unsubscribeFromCoinWSUSD(coin.toUpperCase());
};
export const getAvailableCoins = async () => {
  return await fetch(
    "https://min-api.cryptocompare.com/data/blockchain/list?" +
      new URLSearchParams({ api_key: API_KEY })
  )
    .then((response) => response.json())
    .then((data) => Object.keys(data.Data));
};

addUpdateCoinListenerWS();
addValidateCoinListenerWS();
subscribeToCoin("BTC", (price) => {
  BTCUSD = price;
});
