let browserInstances = [];
onconnect = (e) => {
  const port = e.ports[0];
  browserInstances.push(port);
  port.onmessage = (e) => {
    browserInstances.forEach((port) => port.postMessage(e.data));
  };
};
