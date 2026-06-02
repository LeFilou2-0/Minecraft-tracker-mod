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

// 1. INTERFACE GRAPHIQUE - DEBUG MODE
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Minecraft Tracker - Debug Mode</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        
        <script src="https://unpkg.com/skinview3d@3.0.1/dist/skinview3d.bundle.js"></script>
        
        <style>
            :root { --bg: #08080c; --panel-bg: rgba(255, 255, 255, 0.02); --accent: #a3e635; --border: rgba(255, 255, 255, 0.06); --text-main: #f8fafc; --text-muted: #64748b; }
            body { background-color: var(--bg); color: var(--text-main); font-family: system-ui, sans-serif; margin: 0; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; background: radial-gradient(circle at top, #11111e 0%, #050508 100%); }
            .search-box { display: flex; gap: 12px; margin-bottom: 40px; width: 100%; max-width: 500px; }
            .search-input { flex: 1; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); padding: 16px 20px; border-radius: 14px; color: #fff; font-size: 16px; outline: none; }
            .search-btn { background: var(--accent); color: #000; border: none; padding: 0 28px; border-radius: 14px; font-weight: 700; cursor: pointer; }
            .namemc-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; width: 100%; max-width: 1000px; display: none; }
            .panel { background: var(--panel-bg); border: 1px solid var(--border); border-radius: 20px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .panel-title { font-size: 14px; text-transform: uppercase; color: var(--text-muted); margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
            .panel-title i { color: var(--accent); }
            .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
            .mini-avatar { width: 64px; height: 64px; border-radius: 12px; border: 1px solid var(--border); }
            .profile-title h1 { margin: 0; font-size: 28px; }
            .uuid-badge { font-family: monospace; font-size: 11px; color: var(--text-muted); background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 6px; margin-top: 4px; display: inline-block; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 15px; }
            .info-label { color: var(--text-muted); } .info-value { font-weight: 600; } .info-value.neon { color: var(--accent); }
            .skin-render-box { grid-row: span 2; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 450px; position: relative; }
            #skin-viewer { width: 100%; height: 380px; cursor: grab; }
        </style>
    </head>
    <body>

        <div class="search-box">
            <input type="text" id="username" class="search-input" placeholder="Pseudo Minecraft...">
            <button onclick="trackPlayer()" class="search-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>

        <div class="namemc-grid" id="main-interface">
            <div class="panel">
                <div class="profile-header">
                    <img id="player-head" class="mini-avatar" src="" alt="Tête">
                    <div class="profile-title">
                        <h1 id="player-name">Pseudo</h1>
                        <div id="player-uuid" class="uuid-badge">UUID</div>
                    </div>
                </div>
                
                <div class="panel-title"><i class="fa-solid fa-chart-simple"></i> Tracker</div>
                <div class="info-row"><div class="info-label">Temps</div><div class="info-value neon" id="player-time">-</div></div>
                <div class="info-row"><div class="info-label">Serveur</div><div class="info-value" id="player-server">-</div></div>
            </div>

            <div class="panel skin-render-box">
                <div class="panel-title" style="position: absolute; top: 24px; left: 24px;"><i class="fa-solid fa-cube"></i> Rendu 3D</div>
                <canvas id="skin-viewer"></canvas>
            </div>
        </div>

        <script>
            let skinViewerInstance = null;

            async function trackPlayer() {
                alert("[ÉTAPE 1] Clic détecté. Début du script.");
                
                const pseudo = document.getElementById('username').value.trim();
                if(!pseudo) {
                    alert("Erreur : Champ vide !");
                    return;
                }

                // Vérification du composant 3D
                if (typeof skinview3d === 'undefined') {
                    alert("[ÉTAPE 1.5 - ERREUR] Le script skinview3d n'a pas chargé ! Problème de réseau iPad ou bloqueur de pub.");
                    return;
                } else {
                    alert("[ÉTAPE 2] Moteur 3D détecté avec succès !");
                }

                try {
                    alert("[ÉTAPE 3] Envoi de la requête au serveur Render pour : " + pseudo);
                    const response = await fetch('/api/player/' + pseudo);
                    
                    alert("[ÉTAPE 4] Réponse du serveur reçue. Code HTTP : " + response.status);
                    
                    if(!response.ok) {
                        const errData = await response.json();
                        alert("[ÉTAPE 4 - ERREUR] Le serveur a renvoyé une erreur : " + JSON.stringify(errData));
                        return;
                    }

                    const data = await response.json();
                    alert("[ÉTAPE 5] Données JSON extraites avec succès ! Pseudo : " + data.pseudo);

                    // DOM Updates
                    document.getElementById('player-head').src = "https://mc-heads.net/avatar/" + data.uuid + "/64";
                    document.getElementById('player-name').innerText = data.pseudo;
                    document.getElementById('player-uuid').innerText = data.uuid;
                    document.getElementById('player-time').innerText = data.stats.totalTime + " min";
                    document.getElementById('player-server').innerText = data.stats.lastServer;

                    alert("[ÉTAPE 6] DOM mis à jour. Lancement du rendu 3D...");

                    const skinTexture = data.skinUrl || "https://textures.minecraft.net/texture/1a12bc553b965b263b6107eb1b5042643a6d956e18751347000788647ba944";
                    
                    if (!skinViewerInstance) {
                        skinViewerInstance = new skinview3d.SkinViewer({
                            canvas: document.getElementById('skin-viewer'),
                            width: 320,
                            height: 380,
                            skin: skinTexture
                        });
                        skinViewerInstance.animation = new skinview3d.IdleAnimation();
                        skinViewerInstance.controls.enableZoom = false;
                    } else {
                        skinViewerInstance.loadSkin(skinTexture);
                    }

                    alert("[ÉTAPE 7 - SUCCÈS] Rendu 3D terminé. Affichage de la grille.");
                    document.getElementById('main-interface').style.display = 'grid';

                } catch (err) {
                    alert("[ÉTAPE FINALE - CRASH] Une erreur inattendue est survenue : " + err.message);
                }
            }
        </script>
    </body>
    </html>
    `);
});

// 2. BACKEND API : DEBUG MODE
app.get('/api/player/:pseudo', async (req, res) => {
    const name = req.params.pseudo;
    console.log(`\n--- [NOUVELLE REQUÊTE] Demande reçue pour le pseudo : ${name} ---`);

    try {
        console.log(`[SERVEUR 1] Appel de l'API Ashcon...`);
        const response = await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`);
        
        console.log(`[SERVEUR 2] API Ashcon OK. Code HTTP : ${response.status}`);
        
        if (!response.data || !response.data.uuid) {
            console.log(`[SERVEUR 2.5 - ERREUR] Joueur introuvable dans les données Ashcon.`);
            return res.status(404).json({ error: "Joueur introuvable", source: "Ashcon" });
        }

        const data = response.data;
        console.log(`[SERVEUR 3] UUID brut reçu : ${data.uuid}`);
        
        // Sécurité maximale sur la string
        const uuid = String(data.uuid).replace(/-/g, '');
        console.log(`[SERVEUR 4] UUID nettoyé : ${uuid}`);

        const exactPseudo = data.username;
        const skinUrl = data.textures?.skin?.url || null;
        const capeUrl = data.textures?.cape?.url || null;

        const localData = database[uuid] || { 
            totalTime: 0, 
            lastServer: "Inconnu", 
            lastLogin: "Aucune" 
        };

        console.log(`[SERVEUR 5] Envoi de la réponse finale au client pour ${exactPseudo}.`);
        return res.json({
            pseudo: exactPseudo,
            uuid: uuid,
            skinUrl: skinUrl,
            capeUrl: capeUrl,
            stats: localData
        });

    } catch (error) {
        console.error(`[SERVEUR ERREUR FATALE] ${error.message}`);
        // On renvoie un 500 explicite pour que l'alerte iPad le capte
        return res.status(500).json({ 
            error: "Erreur Serveur Interne", 
            details: error.message 
        });
    }
});

// 3. LANCEMENT DU SERVEUR
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`[SERVEUR DÉMARRÉ] Écoute active sur le port ${PORT}`);
});
