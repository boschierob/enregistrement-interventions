require('dotenv').config();

const express = require('express');
const cors = require('cors'); 
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001  ;

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors()); // 👈 autorise les requêtes cross-origin
app.use(express.json());

// Dossier où les fichiers JSON seront stockés
const dataDir = path.join(__dirname, 'data');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Route POST : enregistre une intervention
app.post('/api/interventions', async (req, res) => {
  const { nom, prenom, mois, interventions } = req.body;
  

  try {
    await Promise.all(interventions.map(intervention =>
      supabase.from('interventions2').insert({
        nom,
        prenom,
        mois,
        jour: intervention.jour,
        client: intervention.client
      })
    ));

    res.status(200).json({ message: 'Interventions enregistrées avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l’enregistrement dans Supabase',error });
  }
});


// Route GET : liste tous les fichiers JSON disponibles
app.get('/interventions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('interventions2')
      .select('*')
      .order('date', { ascending: false }); // optionnel : trie par date décroissante

    if (error) {
      console.error('Erreur lors de la récupération des interventions :', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des interventions.', error });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur serveur :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
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
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
