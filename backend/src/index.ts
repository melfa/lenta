import * as express from 'express';
import * as PouchDB from 'pouchdb';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

const app = express();
const lentaPouch = new PouchDB('lenta');

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://82.202.226.64',
  credentials: true,
  methods: 'GET, PUT, POST, HEAD, DELETE',
  allowedHeaders: 'accept, authorization, content-type, origin, referer, x-csrf-token',
}));
app.use('/db', require('express-pouchdb')(PouchDB));

type Post = {
  url: string,
  title: string,
  user: string,
  publicationTime: Date,
};

app.post('/post', async (req: express.Request, res: express.Response) => {
  const blogPost: Post = req.body;
  await lentaPouch.post(blogPost);
  res.sendStatus(204);
});

app.listen(27513, () => {
  console.log('Listening on port 27513');
});
