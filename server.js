const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Simulation de la base de données de ton futur Mod .jar
let database = {
    "db09281a8b34479e9da2482348239482": { 
        totalTime: 420, 
        lastServer: "play.hypixel.net", 
        lastLogin: "Aujourd'hui à 15:42" 
    }
};

// 1. PAGE D'ACCUEIL : L'interface graphique V2 complète
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Minecraft Tracker Pro - V2</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            :root {
                --bg: #0a0a0f;
                --card-bg: rgba(255, 255, 255, 0.02);
                --accent: #a3e635;
                --border: rgba(255, 255, 255, 0.08);
                --text-main: #ffffff;
                --text-muted: #64748b;
            }

            body {
                background-color: var(--bg);
                color: var(--text-main);
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: radial-gradient(circle at center, #11111a 0%, #050508 100%);
            }

            .search-container {
                margin-bottom: 35px;
                display: flex;
                gap: 12px;
                z-index: 10;
            }

            .search-input {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                padding: 16px 24px;
                border-radius: 16px;
                color: #fff;
                font-size: 16px;
                width: 320px;
                outline: none;
                transition: all 0.3s;
                backdrop-filter: blur(10px);
            }

            .search-input:focus {
                border-color: var(--accent);
                box-shadow: 0 0 20px rgba(163, 230, 53, 0.15);
            }

            .search-btn {
                background: var(--accent);
                color: #000;
                border: none;
                padding: 0 24px;
                border-radius: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 16px;
            }

            .search-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(163, 230, 53, 0.3);
            }

            /* Interface Carte V2 */
            .card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 32px;
                padding: 45px;
                width: 420px;
                text-align: center;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1);
                display: none;
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .avatar-wrapper {
                position: relative;
                width: 130px;
                height: 130px;
                margin: 0 auto 30px auto;
            }

            /* Rendu de la tête du Skin */
            .avatar {
                width: 100%;
                height: 100%;
                border-radius: 24px;
                border: 2px solid var(--accent);
                background-size: cover;
                background-position: center;
                box-shadow: 0 0 35px rgba(163, 230, 53, 0.2);
            }

            h1 {
                margin: 0 0 6px 0;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: -1px;
            }

            .uuid {
                font-size: 11px;
                color: var(--text-muted);
                margin-bottom: 40px;
                font-family: monospace;
                background: rgba(0,0,0,0.3);
                padding: 6px 12px;
                border-radius: 8px;
                display: inline-block;
            }

            .stats-container {
                margin-bottom: 10px;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            }

            .stat-row:last-child {
                border-bottom: none;
            }

            .stat-label {
                color: var(--text-muted);
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .stat-label i {
                color: var(--accent);
                font-size: 16px;
            }

            .stat-value {
                font-weight: 600;
                color: #ffffff;
                font-size: 16px;
            }

            .stat-value.highlight {
                color: var(--accent);
                text-shadow: 0 0 10px rgba(163, 230, 53, 0.3);
            }

            .cape-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(163, 230, 53, 0.06);
                border: 1px solid rgba(163, 230, 53, 0.3);
                color: var(--accent);
                padding: 8px 18px;
                border-radius: 100px;
                font-size: 13px;
                font-weight: 600;
                margin-top: 25px;
            }
        </style>
    </head>
    <body>

        <div class="search-container">
            <input type="text" id="username" class="search-input" placeholder="Pseudo Minecraft...">
            <button onclick="trackPlayer()" class="search-btn">Traquer</button>
        </div>

        <div class="card" id="player-card">
            <div class="avatar-wrapper">
                <div class="avatar" id="player-avatar"></div>
            </div>
            <h1 id="player-name">Pseudo</h1>
            <div class="uuid" id="player-uuid">UUID</div>
            
            <div class="stats-container">
                <div class="stat-row">
                    <div class="stat-label"><i class="fa-solid fa-stopwatch"></i> Temps de jeu</div>
                    <div class="stat-value highlight" id="player-time">0 min</div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><i class="fa-solid fa-network-wired"></i> Serveur actuel</div>
                    <div class="stat-value" id="player-server">-</div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><i class="fa-solid fa-clock"></i> Dernière connexion</div>
                    <div class="stat-value" id="player-last-login">-</div>
                </div>
            </div>

            <div id="cape-area"></div>
        </div>

        <script>
            async function trackPlayer() {
                const pseudo = document.getElementById('username').value.trim();
                if(!pseudo) return;

                try {
                    const response = await fetch('/api/player/' + pseudo);
                    if(!response.ok) throw new Error();
                    const data = await response.json();

                    // Rendre l'avatar (On utilise l'API de visages Crafatar basée sur l'UUID pour un rendu 2D parfait de la tête)
                    document.getElementById('player-avatar').style.backgroundImage = "url('https://crafatar.com/avatars/" + data.uuid + "?size=120&overlay')";
                    
                    document.getElementById('player-name').innerText = data.pseudo;
                    document.getElementById('player-uuid').innerText = data.uuid;
                    document.getElementById('player-time').innerText = data.stats.totalTime + " min";
                    document.getElementById('player-server').innerText = data.stats.lastServer;
                    document.getElementById('player-last-login').innerText = data.stats.lastLogin;

                    const capeArea = document.getElementById('cape-area');
                    if(data.capeUrl) {
                        capeArea.innerHTML = '<div class="cape-badge"><i class="fa-solid fa-shield-halved"></i> Cape détectée</div>';
                    } else {
                        capeArea.innerHTML = '';
                    }

                    document.getElementById('player-card').style.display = 'block';

                } catch (err) {
                    alert("Joueur introuvable ou erreur avec l'API Mojang.");
                }
            }
        </script>
    </body>
    </html>
    `);
});

// 2. L'API BACKEND COMPLÈTE & SÉCURISÉE (Correction robuste pour Mojang)
app.get('/api/player/:pseudo', async (req, res) => {
    try {
        const name = req.params.pseudo;
        
        // Étape A : Obtenir l'UUID de manière sûre
        const profileRes = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        if (!profileRes.data || !profileRes.data.id) {
            return res.status(404).json({ error: "Joueur inexistant" });
        }
        const uuid = profileRes.data.id;
        const exactPseudo = profileRes.data.name;

        // Étape B : Obtenir le profil de session complet (Textures)
        const sessionRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        
        let skinUrl = null;
        let capeUrl = null;

        // Extraction ultra-sécurisée du Base64 pour éviter les crashs si pas de skin/cape
        if (sessionRes.data && sessionRes.data.properties) {
            const textureProp = sessionRes.data.properties.find(p => p.name === 'textures');
            if (textureProp) {
                const texturesJson = JSON.parse(Buffer.from(textureProp.value, 'base64').toString('utf-8'));
                if (texturesJson.textures) {
                    skinUrl = texturesJson.textures.SKIN?.url || null;
                    capeUrl = texturesJson.textures.CAPE?.url || null;
                }
            }
        }

        // Étape C : Récupération des statistiques locales de ton Mod
        const localData = database[uuid] || { 
            totalTime: 0, 
            lastServer: "Aucun (Mod non installé)", 
            lastLogin: "Aucune session enregistrée" 
        };

        // Envoi de la réponse complète et structurée au format JSON
        res.json({
            pseudo: exactPseudo,
            uuid: uuid,
            skinUrl: skinUrl,
            capeUrl: capeUrl,
            stats: localData
        });

    } catch (error) {
        console.error("Erreur API:", error.message);
        res.status(500).json({ error: "Erreur lors de la communication avec Mojang" });
    }
});

// 3. ROUTE COMPATIBLE AVEC TON MOD JAVA (.JAR)
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

app.listen(3000, () => {
    console.log("==> Traqueur Prêt ! Ouvre ton navigateur sur http://localhost:3000");
});
