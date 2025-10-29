const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const emploiTempsRoutes = require('./routes/emploiTemps'); // Ajouter cette ligne

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emploi-temps', emploiTempsRoutes); // Ajouter cette ligne

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});