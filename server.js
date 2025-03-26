const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 3000;
const mongoURL = "mongodb://localhost:27017"; // Update if needed
const dbName = "taskManager";

app.use(express.json());
app.use(cors()); // Enable CORS

let db;
MongoClient.connect(mongoURL).then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");
});

// 🟢 GET all tasks (with filters & sorting)
app.get("/tasks", async (req, res) => {

  const filters = {};

  // ✅ Filter by statut
  if (req.query.statut) filters.statut = req.query.statut;

  // ✅ Filter by priorite
  if (req.query.priorite) filters.priorite = req.query.priorite;

  // ✅ Filter by categorie
  if (req.query.categorie) filters.categorie = req.query.categorie;

  // ✅ Filter by etiquette (check if array contains the value)
  if (req.query.etiquette) filters.etiquettes = { $in: [req.query.etiquette] };

  // ✅ Filter by echeance (before & after)
  if (req.query.apres || req.query.avant) {
      filters.echeance = {};
      if (req.query.apres) filters.echeance.$gte = new Date(req.query.apres);
      if (req.query.avant) filters.echeance.$lte = new Date(req.query.avant);
  }

  // ✅ Search in titre & description (case-insensitive)
  if (req.query.q) {
      filters.$or = [
          { titre: { $regex: req.query.q, $options: "i" } },
          { description: { $regex: req.query.q, $options: "i" } },
      ];
  }

  // 🟢 Fetch tasks from MongoDB with applied filters
  const tasks = await db.collection("tasks").find(filters).toArray();

  console.log("/tasks fetched", tasks.length, "results");  // Log the tasks for debugging

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

// 🟢 POST add comment to task
app.post("/tasks/:id/comment", async (req, res) => {
  const { auteurNom, auteurPrenom, auteurEmail, contenu } = req.body;
  const comment = {
      auteur: { nom: auteurNom, prenom: auteurPrenom, email: auteurEmail },
      date: new Date(),
      contenu,
  };
  
  const update = {
      $push: { commentaires: comment },
  };

  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, update);
  res.json({ message: "Comment added successfully" });
});

// 🟢 POST add subtask to task
app.post("/tasks/:id/subtask", async (req, res) => {
  const { titre, statut, echeance } = req.body;
  const subtask = { titre, statut, echeance: echeance ? new Date(echeance) : null };

  const update = {
      $push: { sousTaches: subtask },
  };

  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, update);
  res.json({ message: "Subtask added successfully" });
});

app.use(express.static("public"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
