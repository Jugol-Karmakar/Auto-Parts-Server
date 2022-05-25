const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0b9nb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const partsCollection = client.db("manufacture").collection("parts");
    const bookingCollection = client.db("manufacture").collection("booking");
    const reviewCollection = client.db("manufacture").collection("review");

    // parts get

    app.get("/parts", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchase = await partsCollection.findOne(query);
      res.send(purchase);
    });

    // parts booking Post

    app.post("/booking", async (req, res) => {
      const parts = req.body;
      const result = await bookingCollection.insertOne(parts);
      res.send(result);
    });

    // add review post

    app.post("/review", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
    });

    // get review

    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
    //   await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("manufacturer parts service");
});

app.listen(port, () => {
  console.log(`manufacture app listening on port ${port}`);
});
