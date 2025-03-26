const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MongoDB connection
const url = 'mongodb://localhost:27017';
const dbName = 'gestionTaches';
let db, tasksCollection;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    tasksCollection = db.collection('tasks');
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes
app.get('/tasks', async (req, res) => {
  const tasks = await tasksCollection.find().toArray();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const { titre, description, echeance, statut, priorite, auteur, categorie, etiquettes, sousTaches, commentaires, historiqueModifications } = req.body;

  // Validate required fields
  if (!titre || !description || !statut || !priorite || !auteur || !categorie) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTask = {
    titre,
    description,
    dateCreation: new Date(),
    echeance: echeance ? new Date(echeance) : null,
    statut,
    priorite,
    auteur,
    categorie,
    etiquettes: etiquettes || [],
    sousTaches: sousTaches || [],
    commentaires: commentaires || [],
    historiqueModifications: historiqueModifications || []
  };

  const result = await tasksCollection.insertOne(newTask);
  res.status(201).json({ _id: result.insertedId, ...newTask });
});

app.delete('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
  res.status(204).send();
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
