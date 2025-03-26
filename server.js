const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
// const cors = require("cors");
const cors = require('cors'); // Import CORS

// const app = express();
const app = express();
const PORT = 3000;
const mongoURL = "mongodb://localhost:27017"; // Update if needed
const dbName = "taskManager";

app.use(express.json());
// app.use(cors());
app.use(cors()); // Enable CORS




let db;
MongoClient.connect(mongoURL).then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");
});

// 🟢 GET all tasks (with filters & sorting)
// 🟢 GET all tasks (with filters & sorting)
app.get("/tasks", async (req, res) => {
  console.log("In /tasks");
  const filters = {};

  // Apply filters
  if (req.query.statut) filters.statut = req.query.statut;
  if (req.query.priorite) filters.priorite = req.query.priorite;

  // Fetch tasks from MongoDB with applied filters and sorting
  const tasks = await db.collection("tasks").find(filters).toArray();

  console.log("Tasks:", tasks);  // Log the tasks for debugging

  res.json(tasks);  // Ensure this sends an array of tasks
});

// 🟢 GET single task
app.get("/tasks/:id", async (req, res) => {
    const task = await db.collection("tasks").findOne({ _id: new ObjectId(req.params.id) });
    task ? res.json(task) : res.status(404).send("Task not found");
});

// 🟢 POST create task
app.post("/tasks", async (req, res) => {
    const newTask = {
        ...req.body,
        dateCreation: new Date(),
    };
    const result = await db.collection("tasks").insertOne(newTask);
    res.status(201).json({ _id: result.insertedId, ...newTask });
});

// 🟢 PUT update task
app.put("/tasks/:id", async (req, res) => {
    const update = { $set: req.body };
    await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, update);
    res.json({ message: "Task updated" });
});

// 🟢 DELETE task
app.delete("/tasks/:id", async (req, res) => {
    await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Task deleted" });
});

app.use(express.static("public"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
