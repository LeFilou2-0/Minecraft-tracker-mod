const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let database = {
    "db09281a8b34479e9da2482348239482": { totalTime: 1250, lastServer: "mc.hypixel.net", lastLogin: "Il y a 10 minutes" }
};

// Route pour servir directement la bibliothèque skinview3d depuis ton propre serveur
app.get('/skinview3d.bundle.js', async (req, res) => {
    try {
        const bundle = await axios.get('https://unpkg.com/skinview3d@3.0.1/dist/skinview3d.bundle.js');
        res.setHeader('Content-Type', 'application/javascript');
        res.send(bundle.data);
    } catch (err) {
        res.status(500).send("// Erreur de téléchargement du bundle 3D");
    }
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Minecraft Tracker - Debug</title>
        <script src="/skinview3d.bundle.js"></script>
        <style>
            body { background: #08080c; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; }
            .search-box { margin-bottom: 30px; }
            canvas { background: #1a1a1a; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class="search-box">
            <input type="text" id="username" placeholder="Pseudo Minecraft...">
            <button onclick="trackPlayer()">Rechercher</button>
        </div>
        <canvas id="skin-viewer" width="300" height="400"></canvas>

        <script>
            let skinViewerInstance = null;

            async function trackPlayer() {
                alert("ÉTAPE 1 : Clic détecté");
                const pseudo = document.getElementById('username').value.trim();
                
                if (typeof skinview3d === 'undefined') {
                    alert("ERREUR : skinview3d refuse toujours de charger sur cet iPad.");
                    return;
                }
                alert("ÉTAPE 2 : Moteur 3D local validé !");

                try {
                    alert("ÉTAPE 3 : Envoi requête backend...");
                    const response = await fetch('/api/player/' + pseudo);
                    
                    if(!response.ok) {
                        alert("ERREUR HTTP SERVEUR : " + response.status);
                        return;
                    }

                    const data = await response.json();
                    alert("ÉTAPE 4 : Joueur trouvé -> " + data.pseudo);

                    if (!skinViewerInstance) {
                        skinViewerInstance = new skinview3d.SkinViewer({
                            canvas: document.getElementById('skin-viewer'),
                            width: 300,
                            height: 400,
                            skin: data.skinUrl || "https://textures.minecraft.net/texture/1a12bc553b965b263b6107eb1b5042643a6d956e18751347000788647ba944"
                        });
                        skinViewerInstance.animation = new skinview3d.IdleAnimation();
                    } else {
                        skinViewerInstance.loadSkin(data.skinUrl);
                    }
                    alert("ÉTAPE 5 : Rendu injecté avec succès !");

                } catch (err) {
                    alert("ERREUR SCRIPT CRASH : " + err.message);
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/api/player/:pseudo', async (req, res) => {
    const name = req.params.pseudo;
    console.log("Pseudo demandé :", name);

    try {
        // Utilisation de Ashcon car l'API Mojang de base bloque les requêtes provenant de Render
        const response = await axios.get("https://api.ashcon.app/mojang/v2/user/" + name);
        const data = response.data;
        const uuid = data.uuid.replace(/-/g, '');
        
        res.json({
            pseudo: data.username,
            uuid: uuid,
            skinUrl: data.textures?.skin?.url || null
        });
        console.log("Statut : Succès pour", name);

    } catch (error) {
        console.error("Erreur API :", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Serveur en ligne : " + PORT));
