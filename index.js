require("dotenv").config();
const path = require("path");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
var admin = require("firebase-admin");

app.use(express.json());
app.use(cors());

const serviceAccountPath = path.resolve(process.env.FB_SERVICE_KEY_PATH);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkxiogp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    // console.log(decoded);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: "Unauthorized access." });
  }
};

async function run() {
  try {
    const marathonCollection = client.db("marathonDB").collection("marathon");
    const userCollection = client.db("marathonDB").collection("users");
    const opinionCollection = client.db("marathonDB").collection("opinion");
    const volantiarCollection = client.db("marathonDB").collection("volantiar");

    app.post("/marathons", verifyJWT, async (req, res) => {
      try {
        const newMarathon = req.body;
        if (!newMarathon) {
          return res.status(400).json({ error: "Invalid marathon data" });
        }
        const result = await marathonCollection.insertOne(newMarathon);
        res.status(201).json({
          message: "Marathon created successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting marathon:", error);
        res.status(500).json({ error: "Failed to create marathon" });
      }
    });

    app.get("/created-by/:email", verifyJWT, async (req, res) => {
      try {
        const email = req.params.email;
        const result = await marathonCollection
          .find({ createdBy: email })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching marathons:", error);
        res.status(500).send({ error: "Failed to fetch marathons" });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ error: "Failed to insert user" });
      }
    });

    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await userCollection.findOne({ email });

        if (!result) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json(result);
      } catch (error) {
        console.error("failed to get user data", error);
        res.status(500).json({ error: "Failed to get user data" });
      }
    });

    app.patch(
      "/update-registration/:marathonId",
      verifyJWT,
      async (req, res) => {
        try {
          const { marathonId } = req.params;
          const { userId, updatedData } = req.body;

          const result = await marathonCollection.updateOne(
            {
              _id: new ObjectId(marathonId),
              "totalRegistrationCount.userId": userId,
            },
            {
              $set: {
                "totalRegistrationCount.$": updatedData,
              },
            }
          );

          if (result.modifiedCount === 0) {
            return res.status(404).send({ error: "Registration not found" });
          }

          res.send(result);
        } catch (error) {
          console.error("Error updating registration:", error);
          res.status(500).send({ error: "Failed to update registration" });
        }
      }
    );

    app.get("/marathon/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("Fetching marathon with ID:", id);

        // Validate ID format first
        if (!ObjectId.isValid(id)) {
          console.log("Invalid ID format:", id);
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const query = { _id: new ObjectId(id) };
        console.log("MongoDB query:", query);

        const result = await marathonCollection.findOne(query);
        console.log("Query result:", result);

        if (!result) {
          return res.status(404).json({ error: "Marathon not found" });
        }

        // Explicitly set content-type
        res.setHeader("Content-Type", "application/json");
        res.json(result);
      } catch (error) {
        console.error("Error fetching marathon:", error);
        res.status(500).json({
          error: "Failed to fetch marathon",
          details: error.message,
        });
      }
    });

    app.get("/my-registrations/:userId", async (req, res) => {
      try {
        const userId = req.params.userId;

        const marathons = await marathonCollection
          .find({
            totalRegistrationCount: {
              $elemMatch: { userId: userId },
            },
          })
          .toArray();

        res.status(200).json(marathons);
      } catch (error) {
        console.error("Error fetching marathons:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    app.post("/volantiar", async (req, res) => {
      const data = req.body;
      try {
        const result = await volantiarCollection.insertOne(data);
        res.send(result);
      } catch {
        res.send({ error: "Failed to upload" });
      }
    });

    app.get("/volantiar", async (req, res) => {
      const result = await volantiarCollection.find().limit(4).toArray();
      res.send(result);
    });

    app.get("/marathons-6", async (req, res) => {
      try {
        const result = await marathonCollection.find().limit(4).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching marathons:", error);
        res.status(500).send({ error: "Failed to fetch marathons" });
      }
    });

    app.get("/marathons", async (req, res) => {
      try {
        const result = await marathonCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching all marathons:", error);
        res.status(500).send({ error: "Failed to fetch marathons" });
      }
    });

    app.get("/marathons/:email", verifyJWT, async (req, res) => {
      try {
        const { email } = req.params;
        const result = await marathonCollection.find().toArray(); // Optional: filter by email if intended
        res.send(result);
      } catch (error) {
        console.error("Error fetching marathons by email:", error);
        res.status(500).send({ error: "Failed to fetch marathons" });
      }
    });

    app.patch("/marathon/:id", verifyJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = req.body;
        const result = await marathonCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating marathon:", error);
        res.status(500).send({ error: "Failed to update marathon" });
      }
    });

    app.get("/my-applied-marathons/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const result = await marathonCollection
          .find({
            "totalRegistrationCount.email": email,
          })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching applied marathons:", error);
        res.status(500).send({ error: "Failed to fetch applied marathons" });
      }
    });

    app.patch(
      "/cancel-registration/:marathonId",
      verifyJWT,
      async (req, res) => {
        try {
          const { marathonId } = req.params;
          const { userId } = req.body;

          if (!userId) {
            return res.status(400).json({ error: "userId is required" });
          }

          const result = await marathonCollection.updateOne(
            { _id: new ObjectId(marathonId) },
            {
              $pull: {
                totalRegistrationCount: { userId: userId },
              },
            }
          );

          if (result.modifiedCount === 0) {
            return res.status(404).json({
              error: "User registration not found or already removed",
            });
          }

          res.status(200).json({
            message: "Registration cancelled successfully",
            result,
          });
        } catch (error) {
          console.error("Error cancelling registration:", error);
          res.status(500).json({ error: "Failed to cancel registration" });
        }
      }
    );

    app.patch("/marathonApply/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateOperation = req.body;
        const result = await marathonCollection.updateOne(
          { _id: new ObjectId(id) },
          updateOperation
        );
        res.send(result);
      } catch (error) {
        console.error("Error applying to marathon:", error);
        res.status(500).send({ error: "Failed to apply to marathon" });
      }
    });

    app.post("/opinion", async (req, res) => {
      try {
        const newOpinion = req.body;
        const result = await opinionCollection.insertOne(newOpinion);
        res.send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ error: "Failed to insert user" });
      }
    });

    app.get("/opinion", async (req, res) => {
      try {
        const result = await opinionCollection.find().limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching marathons:", error);
        res.status(500).send({ error: "Failed to fetch marathons" });
      }
    });

    app.delete("/marathon/:id", verifyJWT, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await marathonCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting marathon:", error);
        res.status(500).send({ error: "Failed to delete marathon" });
      }
    });

    
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Do not close the client here to keep the server alive
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  try {
    res.send("Hello World!");
  } catch (error) {
    console.error("Error in root route:", error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
