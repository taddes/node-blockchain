const app = require('express')();
const bodyParser = require('body-parser');
const httpServer = require('http').Server(app);
const axios = require('axios');
const io = require('socket.io')(httpServer);
const client = require('socket.io-client')

const Blockchain = require('./models/chain');
const SocketActions = require('./constants');
const socketListeners = require('./socketListeners');

const { PORT } = process.env;

const blockchain = new Blockchain(null, io);

app.use(bodyParser.json());

app.post('/nodes', (req, res) => {
  const { host, port } = req.body;
  const {callback } = req.query;
  const node = `http://${host}:${port}`;
  const socketNode = socketListeners(client(node), blockchain);
  blockchain.addNode(socketNode, blockchain);
  if (callback === 'true') {
    console.info(`Added node ${node} back`);
    res.json({ status: 'Added node back'}).end();
  } else {
    axios.post(`${node}/nodes?callback=true`, {
      host: req.hostname,
      port: PORT
    });
    console.info(`Added node ${node}`);
    res.json({ status: 'Added node' }).end
  }
});

app.post('/transaction', (req,res) => {
  const { sender, receiver, amount } = req.body;
  io.emit(SocketActions.ADD_TRANSACTION, sender, receiver, amount);
  res.json({ message: 'Transaction Success' }).end();
});

app.get('/chain', (req, res) => {
  res.json(blockchain.toArray()).end();
});

io.on('connection', (socket) => {
  console.info(`Socket connection established. ID: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket Connection Terminated. ID: ${socket.id}`);
  });
});

blockchain.addNode(socketListeners(client(`http://localhost:${PORT}`), blockchain));

httpServer.listen(PORT, () => console.info(`Server running on port http://localhost:${PORT}`));