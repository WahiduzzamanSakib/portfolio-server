const express = require('express');
const app = express();
const cors = require('cors');

const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


dotenv.config();

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    await client.connect();

    const db = client.db("personal-portfolio")
    const projectCollection = db.collection("all-projects")


    app.get('/projects', async (req, res) => {
      const { ownerEmail } = req.query;

      const result = await projectCollection
        .find({ ownerEmail })
        .toArray();

      res.json(result);
    });

    app.post('/projects', async (req, res) => {
      const projectData = req.body
      const result = await projectCollection.insertOne(projectData)
      res.json(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running fine!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});