const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Simulation de la base de données locale
let database = {
    "db09281a8b34479e9da2482348239482": { 
        totalTime: 1250, 
        lastServer: "mc.hypixel.net", 
        lastLogin: "Il y a 10 minutes" 
    }
};

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Minecraft Tracker - Debug</title>
        <script src="https://unpkg.com/skinview3d@3.0.1/dist/skinview3d.bundle.js"></script>
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
                    alert("ERREUR : skinview3d non chargé !");
                    return;
                }
                alert("ÉTAPE 2 : skinview3d est bien chargé");

                try {
                    alert("ÉTAPE 3 : Appel API en cours...");
                    const response = await fetch('/api/player/' + pseudo);
                    
                    if(!response.ok) {
                        alert("ERREUR HTTP : " + response.status);
                        return;
                    }

                    const data = await response.json();
                    alert("ÉTAPE 4 : Données reçues pour " + data.pseudo);

                    const skinTexture = data.skinUrl || "https://textures.minecraft.net/texture/1a12bc553b965b263b6107eb1b5042643a6d956e18751347000788647ba944";
                    
                    if (!skinViewerInstance) {
                        skinViewerInstance = new skinview3d.SkinViewer({
                            canvas: document.getElementById('skin-viewer'),
                            width: 300,
                            height: 400,
                            skin: skinTexture
                        });
                        skinViewerInstance.animation = new skinview3d.IdleAnimation();
                    } else {
                        skinViewerInstance.loadSkin(skinTexture);
                    }
                    alert("ÉTAPE 5 : Rendu 3D terminé");

                } catch (err) {
                    alert("ERREUR FATALE : " + err.message);
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/api/player/:pseudo', async (req, res) => {
    const name = req.params.pseudo;
    console.log("Requête reçue pour :", name);

    try {
        const response = await axios.get("https://api.ashcon.app/mojang/v2/user/" + name);
        
        const data = response.data;
        const uuid = data.uuid.replace(/-/g, '');
        
        res.json({
            pseudo: data.username,
            uuid: uuid,
            skinUrl: data.textures?.skin?.url || null
        });
        console.log("Réponse envoyée avec succès.");

    } catch (error) {
        console.error("Erreur serveur :", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Serveur démarré sur port " + PORT));
