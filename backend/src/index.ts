import * as express from 'express';
import * as PouchDB from 'pouchdb';
import * as bodyParser from 'body-parser';

const RedisPouchDB = PouchDB.defaults({ db: require('redisdown') } as any);
const app = express();
const lentaPouch = new RedisPouchDB('lenta');

app.use(bodyParser.json());
app.use('/db', require('express-pouchdb')(RedisPouchDB));

type Post = {
  id: string,
  title: string,
  url: string,
  creationTime: Date,
};

app.post('/post', async (req: express.Request, res: express.Response) => {
  const blogPost: Post = req.body;
  await lentaPouch.post(blogPost);
  res.sendStatus(204);
});

app.listen(27513, () => {
  console.log('Listening on port 27513');
});
