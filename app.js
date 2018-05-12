const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { shopSync } = require('./index');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.post('/rpc/sync_stores', (req, res) => {
  shopSync(req.body.storeIds)
  res.send('Synced!');
})

app.listen(3000, () => console.log('App listening on port 3000!'))