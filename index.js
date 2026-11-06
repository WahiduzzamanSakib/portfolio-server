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


    // active / inactive status update
    app.patch('/projects/:id/status', async (req, res) => {
      const { id } = req.params;
      const { isActive } = req.body;

      const result = await projectCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive } }
      );

      res.json(result);
    });


    // project order update
    app.patch('/projects/order', async (req, res) => {
      const { projects } = req.body;

      const operations = projects.map((project) => ({
        updateOne: {
          filter: { _id: new ObjectId(project.id) },
          update: { $set: { order: project.order } }
        }
      }));

      const result = await projectCollection.bulkWrite(operations);

      res.json(result);
    });


    // delete project
    app.delete('/projects/:id', async (req, res) => {
      const { id } = req.params;

      const result = await projectCollection.deleteOne({
        _id: new ObjectId(id)
      });

      res.json(result);
    });

    // single project details by custom id
    app.get('/projects/:id', async (req, res) => {
      const { id } = req.params;

      const result = await projectCollection.findOne({
        id: id
      });

      res.json(result);
    });

    // active projects 
    app.get('/projects', async (req, res) => {
      const result = await projectCollection
        .find({ isActive: true })
        .sort({ order: 1 })
        .toArray();

      res.json(result);
    });

    // owner all projects
    // app.get('/my-projects', async (req, res) => {
    //   const { ownerEmail } = req.query;

    //   const result = await projectCollection
    //     .find({ ownerEmail })
    //     .sort({ order: 1 })
    //     .toArray();

    //   res.json(result);
    // });

    app.get('/my-projects', async (req, res) => {
      const result = await projectCollection
        .find({})
        .sort({ order: 1 })
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