const API_KEY =
  "4afb0518d5d1953fbc80d99670295d1a256c42d4432852c4b27e0ef762272587";
const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const TOO_MANY_SOCKETS = "429";

const coins = new Map();
const coinsValidated = new Map();
const socket = new WebSocket(
  "wss://streamer.cryptocompare.com/v2?api_key=" + API_KEY
);
const myWorker = new SharedWorker("sharedWorkerConfig.js");
myWorker.port.start();
let isMainSocket = true;
let BTCUSD = 0;

const sendToWorker = (message) => {
  myWorker.port.postMessage(JSON.stringify(message));
};
const addSocketMessageListener = (type, func) => {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.TYPE === type) {
      func(message);
      sendToWorker(message);
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
  if (message.TYPE === AGGREGATE_INDEX) {
    const {
      FROMSYMBOL: currency,
      PRICE: price,
      TOSYMBOL: toCurrency,
    } = message;
    if (price) {
      const handlers = coins.get(currency) ?? [];
      let correctedPrice = price;
      if (toCurrency === "BTC") {
        correctedPrice = price * BTCUSD;
      }
      correctedPrice =
        correctedPrice > 1
          ? correctedPrice.toFixed(2)
          : correctedPrice.toPrecision(2);
      handlers.forEach((f) => f(correctedPrice));
    }
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
  const sendFunc = isMainSocket ? sendToWS : sendToWorker;
  sendFunc({
    action: "SubAdd",
    subs: [`5~CCCAGG~${coin}~BTC`],
  });
};
const unsubscribeFromCoinWSBTC = (coin) => {
  const sendFunc = isMainSocket ? sendToWS : sendToWorker;
  sendFunc({
    action: "SubRemove",
    subs: [`5~CCCAGG~${coin}~BTC`],
  });
};
const subscribeToCoinWSUSD = (coin) => {
  const sendFunc = isMainSocket ? sendToWS : sendToWorker;
  sendFunc({
    action: "SubAdd",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
const unsubscribeFromCoinWSUSD = (coin) => {
  const sendFunc = isMainSocket ? sendToWS : sendToWorker;
  sendFunc({
    action: "SubRemove",
    subs: [`5~CCCAGG~${coin}~USD`],
  });
};
const addWorkerListener = () => {
  myWorker.port.onmessage = (e) => {
    const message = JSON.parse(e.data);
    if (isMainSocket) {
      if (message.action?.includes("Sub")) {
        sendToWS(message);
      }
    } else {
      updateCoin(message);
      isCorrectCoin(message);
    }
  };
};

const addAnotherSocketIsOpenListener = () => {
  addSocketMessageListener(TOO_MANY_SOCKETS, () => {
    isMainSocket = false;
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
addAnotherSocketIsOpenListener();
addWorkerListener();
subscribeToCoin("BTC", (price) => {
  BTCUSD = price;
});
