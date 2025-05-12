const express = require('express');
const cors = require('cors'); 
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());

// Dossier où les fichiers JSON seront stockés
const dataDir = path.join(__dirname, 'data');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Route POST : enregistre une intervention
app.post('/api/interventions', (req, res) => {
  const data = req.body;
  const filename = `intervention_${Date.now()}.json`;
  const filePath = path.join(dataDir, filename);

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Erreur d\'écriture :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.status(200).json({ message: 'Enregistrement réussi', filename });
  });
});

// Route GET : liste tous les fichiers JSON disponibles
app.get('/api/interventions/list', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Erreur de lecture du dossier :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    // Ne retourne que les fichiers JSON
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.status(200).json({ files: jsonFiles });
  });
});

// Route GET : télécharge un fichier spécifique
app.get('/api/interventions/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(dataDir, filename);

  // Vérifie que le fichier existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier non trouvé' });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Erreur de téléchargement :', err);
      res.status(500).send('Erreur lors du téléchargement');
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur sur http://localhost:${PORT}`);
});
