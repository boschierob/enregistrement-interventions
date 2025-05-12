const express = require('express');
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

// Route POST pour enregistrer les données
app.post('/api/interventions', (req, res) => {
  const data = req.body;

  // Nom de fichier unique avec timestamp
  const filename = `intervention_${Date.now()}.json`;
  const filePath = path.join(dataDir, filename);

  // Écriture des données dans un fichier JSON
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Erreur d\'écriture du fichier :', err);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement.' });
    }
    res.status(200).json({ message: 'Intervention enregistrée avec succès.' });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
