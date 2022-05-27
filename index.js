const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0b9nb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorization Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbiden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();

    const partsCollection = client.db("manufacture").collection("parts");
    const bookingCollection = client.db("manufacture").collection("booking");
    const reviewCollection = client.db("manufacture").collection("review");
    const userCollection = client.db("manufacture").collection("users");

    // parts get

    app.get("/parts", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    // parts gets id
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchase = await partsCollection.findOne(query);
      res.send(purchase);
    });

    // parts booking get
    app.get("/booking", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const bookings = await bookingCollection.find(query).toArray();
        return res.send(bookings);
      } else {
        return res.status(403).send({ message: "Forbiden Access" });
      }
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

    // get users
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // users admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // users put
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ result, token });
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
