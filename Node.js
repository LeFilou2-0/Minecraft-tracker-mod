const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
// Indique à Node de servir le dossier "public" où se trouve ton index.html
app.use(express.static(path.join(__dirname, 'public')));

// Simulation de la base de données alimentée par ton fichier .jar (le mod)
let database = {
    "db09281a8b34479e9da2482348239482": { 
        totalTime: 384, 
        lastServer: "play.hypixel.net", 
        lastLogin: "Aujourd'hui à 15:42" 
    }
};

// Route API utilisée par le site web pour charger les infos d'un joueur
app.get('/api/player/:pseudo', async (req, res) => {
    try {
        const name = req.params.pseudo;
        
        // 1. Récupération de l'UUID via Mojang
        const profile = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        const uuid = profile.data.id;

        // 2. Récupération des textures (Skin / Cape)
        const session = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        const texturesBase64 = session.data.properties[0].value;
        const textures = JSON.parse(Buffer.from(texturesBase64, 'base64').toString());

        // 3. Liaison avec les statistiques de ton Mod local
        const localData = database[uuid] || { totalTime: 0, lastServer: "Hors-ligne (Mod manquant)", lastLogin: "Aucune session" };

        res.json({
            pseudo: profile.data.name,
            uuid: uuid,
            skinUrl: textures.textures.SKIN?.url || "https://textures.minecraft.net/texture/32b1367feaabc2d73f32b1367feaabc2d73f",
            capeUrl: textures.textures.CAPE?.url || null,
            stats: localData
        });
    } catch (e) {
        res.status(404).json({ error: "Impossible de récupérer les profils Mojang." });
    }
});

// Route POST appelée en arrière-plan par le mod Minecraft .jar
app.post('/api/update-stats', (req, res) => {
    const { uuid, serverIp, playTimeDelta } = req.body;
    if(!uuid) return res.status(400).send("UUID manquant");
    
    if(!database[uuid]) {
        database[uuid] = { totalTime: 0, lastServer: "", lastLogin: "" };
    }
    database[uuid].totalTime += playTimeDelta;
    database[uuid].lastServer = serverIp;
    database[uuid].lastLogin = new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    res.status(200).json({ status: "synced" });
});

// Lancement global du réseau local
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[Tracker Engine] Serveur en ligne sur http://localhost:${PORT}`);
});
