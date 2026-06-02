const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Simulation de la base de données locale (Mod .jar)
let database = {
    "db09281a8b34479e9da2482348239482": { 
        totalTime: 1250, 
        lastServer: "mc.hypixel.net", 
        lastLogin: "Il y a 10 minutes" 
    }
};

// 1. INTERFACE GRAPHIQUE STYLE NAMEMC x V2 NEON
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Minecraft Tracker - NameMC Edition</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            :root {
                --bg: #08080c;
                --panel-bg: rgba(255, 255, 255, 0.02);
                --accent: #a3e635;
                --border: rgba(255, 255, 255, 0.06);
                --text-main: #f8fafc;
                --text-muted: #64748b;
            }

            body {
                background-color: var(--bg);
                color: var(--text-main);
                font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                background: radial-gradient(circle at top, #11111e 0%, #050508 100%);
            }

            /* Barre de recherche supérieure */
            .search-box {
                display: flex;
                gap: 12px;
                margin-bottom: 40px;
                width: 100%;
                max-width: 500px;
            }

            .search-input {
                flex: 1;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                padding: 16px 20px;
                border-radius: 14px;
                color: #fff;
                font-size: 16px;
                outline: none;
                transition: all 0.3s;
                backdrop-filter: blur(8px);
            }

            .search-input:focus {
                border-color: var(--accent);
                box-shadow: 0 0 20px rgba(163, 230, 53, 0.15);
            }

            .search-btn {
                background: var(--accent);
                color: #000;
                border: none;
                padding: 0 28px;
                border-radius: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }

            .search-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(163, 230, 53, 0.25);
            }

            /* Conteneur principal en Grille (Style NameMC) */
            .namemc-grid {
                display: grid;
                grid-template-columns: 1fr 1.2fr;
                gap: 24px;
                width: 100%;
                max-width: 1000px;
                display: none; /* Masqué avant la recherche */
            }

            /* Blocs/Briques modulaires */
            .panel {
                background: var(--panel-bg);
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 24px;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }

            .panel-title {
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-muted);
                margin-top: 0;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .panel-title i {
                color: var(--accent);
            }

            /* Colonne Gauche - Infos de profil */
            .profile-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 24px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                padding-bottom: 20px;
            }

            .mini-avatar {
                width: 64px;
                height: 64px;
                border-radius: 12px;
                border: 1px solid var(--border);
            }

            .profile-title h1 {
                margin: 0;
                font-size: 28px;
                letter-spacing: -0.5px;
            }

            .uuid-badge {
                font-family: monospace;
                font-size: 11px;
                color: var(--text-muted);
                background: rgba(0,0,0,0.4);
                padding: 4px 8px;
                border-radius: 6px;
                margin-top: 4px;
                display: inline-block;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255,255,255,0.03);
                font-size: 15px;
            }

            .info-row:last-child { border-bottom: none; }
            .info-label { color: var(--text-muted); }
            .info-value { font-weight: 600; }
            .info-value.neon { color: var(--accent); }

            /* Colonne Droite - Grand rendu de Skin 3D */
            .skin-render-box {
                grid-row: span 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 450px;
                position: relative;
            }

            .skin-3d-img {
                max-height: 380px;
                object-fit: contain;
                filter: drop-shadow(0 20px 30px rgba(0,0,0,0.7));
                transition: transform 0.3s;
            }

            .skin-3d-img:hover {
                transform: scale(1.03);
            }

            /* Bloc Capes personnalisé */
            .cape-container {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .cape-item {
                background: rgba(163, 230, 53, 0.04);
                border: 1px dashed var(--accent);
                border-radius: 10px;
                padding: 10px 16px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--accent);
                font-weight: bold;
            }

            .no-cape {
                color: var(--text-muted);
                font-size: 14px;
                font-style: italic;
            }

            /* Ligne du bas - Historique des Skins */
            .history-box {
                grid-column: span 2;
            }

            .history-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 16px;
            }

            .history-card {
                background: rgba(255,255,255,0.01);
                border: 1px solid var(--border);
                border-radius: 14px;
                padding: 16px;
                text-align: center;
                position: relative;
                transition: all 0.2s;
            }

            .history-card:hover {
                border-color: var(--accent);
                background: rgba(163, 230, 53, 0.01);
            }

            .history-card img {
                height: 120px;
                object-fit: contain;
                margin-bottom: 10px;
            }

            .history-number {
                position: absolute;
                top: 10px;
                left: 10px;
                font-size: 11px;
                font-weight: bold;
                background: rgba(255,255,255,0.05);
                padding: 2px 6px;
                border-radius: 4px;
                color: var(--text-muted);
            }

            .history-date {
                font-size: 12px;
                color: var(--text-muted);
            }
        </style>
    </head>
    <body>

        <div class="search-box">
            <input type="text" id="username" class="search-input" placeholder="Entrez un pseudo Minecraft (ex: Notch)...">
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
                
                <div class="panel-title"><i class="fa-solid fa-chart-simple"></i> Données du Tracker</div>
                <div class="info-row">
                    <div class="info-label">Temps de jeu global</div>
                    <div class="info-value neon" id="player-time">0 min</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Serveur actuel</div>
                    <div class="info-value" id="player-server">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Dernière activité</div>
                    <div class="info-value" id="player-last-login">-</div>
                </div>
            </div>

            <div class="panel skin-render-box">
                <div class="panel-title" style="position: absolute; top: 24px; left: 24px;">
                    <i class="fa-solid fa-cube"></i> Rendu 3D du Skin
                </div>
                <img id="skin-3d" class="skin-3d-img" src="" alt="Rendu Complet">
            </div>

            <div class="panel">
                <div class="panel-title"><i class="fa-solid fa-shield-halved"></i> Capes Alignées</div>
                <div id="cape-wrapper" class="cape-container">
                    </div>
            </div>

            <div class="panel history-box">
                <div class="panel-title"><i class="fa-solid fa-clock-rotate-left"></i> Historique des Skins</div>
                <div class="history-grid" id="history-wrapper">
                    </div>
            </div>

        </div>

        <script>
            async function trackPlayer() {
                const pseudo = document.getElementById('username').value.trim();
                if(!pseudo) return;

                try {
                    const response = await fetch('/api/player/' + pseudo);
                    if(!response.ok) throw new Error();
                    const data = await response.json();

                    // 1. Remplissage du Bloc Profil
                    document.getElementById('player-head').src = "https://mc-heads.net/avatar/" + data.uuid + "/64";
                    document.getElementById('player-name').innerText = data.pseudo;
                    document.getElementById('player-uuid').innerText = data.uuid;
                    
                    // Stats issus de ton mod .jar
                    document.getElementById('player-time').innerText = data.stats.totalTime + " min";
                    document.getElementById('player-server').innerText = data.stats.lastServer;
                    document.getElementById('player-last-login').innerText = data.stats.lastLogin;

                    // 2. Remplissage du grand corps complet en 3D Isométrique (VRAI 3D)
                    document.getElementById('skin-3d').src = "https://visage.surgeplay.com/full/400/" + data.uuid;

                    // 3. Gestion dynamique des capes (Design épuré)
                    const capeWrapper = document.getElementById('cape-wrapper');
                    if (data.capeUrl) {
                        capeWrapper.innerHTML = \`
                            <div class="cape-item">
                                <i class="fa-solid fa-gavel"></i> Cape Officielle Mojang
                            </div>
                        \`;
                    } else {
                        capeWrapper.innerHTML = '<span class="no-cape">Aucune cape détectée sur ce compte.</span>';
                    }

                    // 4. Génération de l'historique des skins (façon NameMC)
                    const historyWrapper = document.getElementById('history-wrapper');
                    historyWrapper.innerHTML = ''; // Clear ancien

                    // On génère 3 versions pour illustrer la frise chronologique (Actuel + Historique)
                    // Utilise le skin actuel pour la démo, changeant selon l'UUID recherché
                    const skinTemplates = [
                        { label: "Actuel", date: "Aujourd'hui" },
                        { label: "#2", date: "Janv. 2026" },
                        { label: "#1", date: "Création" }
                    ];

                    skinTemplates.forEach((skin, index) => {
                        const card = document.createElement('div');
                        card.className = 'history-card';
                        card.innerHTML = \`
                            <div class="history-number">\${skin.label}</div>
                            <img src="https://visage.surgeplay.com/bust/120/${data.uuid}" alt="Skin body">
                            <div class="history-date">\${skin.date}</div>
                        \`;
                        historyWrapper.appendChild(card);
                    });

                    // Rendre visible toute la structure NameMC d'un coup
                    document.getElementById('main-interface').style.display = 'grid';

                } catch (err) {
                    alert("Impossible de charger le profil complet de ce joueur.");
                }
            }
        </script>
    </body>
    </html>
    `);
});

// 2. BACKEND API : Récupération sécurisée et complète
app.get('/api/player/:pseudo', async (req, res) => {
    try {
        const name = req.params.pseudo;
        
        const profileRes = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        if (!profileRes.data || !profileRes.data.id) {
            return res.status(404).json({ error: "Joueur introuvable" });
        }
        const uuid = profileRes.data.id;
        const exactPseudo = profileRes.data.name;

        const sessionRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        
        let skinUrl = null;
        let capeUrl = null;

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

        const localData = database[uuid] || { 
            totalTime: 0, 
            lastServer: "Inconnu (Mod déconnecté)", 
            lastLogin: "Aucune session synchronisée" 
        };

        res.json({
            pseudo: exactPseudo,
            uuid: uuid,
            skinUrl: skinUrl,
            capeUrl: capeUrl,
            stats: localData
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur API Mojang" });
    }
});

// 3. RECEPTION DES REQUÊTES DU MOD JAR
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
    console.log("==> Interface NameMC prête sur http://localhost:3000");
});
