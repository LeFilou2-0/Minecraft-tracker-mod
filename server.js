const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Base de données temporaire en mémoire
let database = {
    "db09281a8b34479e9da2482348239482": { 
        totalTime: 1250, 
        lastServer: "mc.hypixel.net", 
        lastLogin: "Il y a 10 minutes" 
    }
};

// 1. INTERFACE GRAPHIQUE STYLE NAMEMC (Rendu Fixe Ultra-Fiable)
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

            .namemc-grid {
                display: grid;
                grid-template-columns: 1fr 1.2fr;
                gap: 24px;
                width: 100%;
                max-width: 1000px;
                display: none;
            }

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

            .panel-title i { color: var(--accent); }

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

            .profile-title h1 { margin: 0; font-size: 28px; letter-spacing: -0.5px; }

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

            .skin-render-box {
                grid-row: span 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 450px;
            }

            .skin-display {
                max-height: 380px;
                object-fit: contain;
                filter: drop-shadow(0 12px 24px rgba(0,0,0,0.6));
            }

            .cape-container { display: flex; gap: 12px; flex-wrap: wrap; }
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

            .no-cape { color: var(--text-muted); font-size: 14px; font-style: italic; }
            .history-box { grid-column: span 2; }
            .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }

            .history-card {
                background: rgba(255,255,255,0.01);
                border: 1px solid var(--border);
                border-radius: 14px;
                padding: 16px;
                text-align: center;
                position: relative;
            }

            .history-card img { height: 120px; object-fit: contain; margin-bottom: 10px; }
            .history-number { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: bold; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); }
            .history-date { font-size: 12px; color: var(--text-muted); }
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
                <div class="panel-title" style="align-self: flex-start; margin-bottom: auto;">
                    <i class="fa-solid fa-cube"></i> Visuel du Personnage
                </div>
                <img id="skin-img" class="skin-display" src="" alt="Skin Minecraft">
            </div>

            <div class="panel">
                <div class="panel-title"><i class="fa-solid fa-shield-halved"></i> Capes Alignées</div>
                <div id="cape-wrapper" class="cape-container"></div>
            </div>

            <div class="panel history-box">
                <div class="panel-title"><i class="fa-solid fa-clock-rotate-left"></i> Historique des Skins</div>
                <div class="history-grid" id="history-wrapper"></div>
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

                    // Mise à jour des textes et avatars basiques
                    document.getElementById('player-head').src = "https://mc-heads.net/avatar/" + data.uuid + "/64";
                    document.getElementById('player-name').innerText = data.pseudo;
                    document.getElementById('player-uuid').innerText = data.uuid;
                    
                    document.getElementById('player-time').innerText = data.stats.totalTime + " min";
                    document.getElementById('player-server').innerText = data.stats.lastServer;
                    document.getElementById('player-last-login').innerText = data.stats.lastLogin;

                    // Image du corps entier fixe (Générée côté API)
                    document.getElementById('skin-img').src = "https://mc-heads.net/body/" + data.uuid + "/300";

                    // Gestion de la cape
                    const capeWrapper = document.getElementById('cape-wrapper');
                    if (data.capeUrl) {
                        capeWrapper.innerHTML = `
                            <div class="cape-item">
                                <i class="fa-solid fa-gavel"></i> Cape Officielle Mojang
                            </div>
                        `;
                    } else {
                        capeWrapper.innerHTML = '<span class="no-cape">Aucune cape détectée sur ce compte.</span>';
                    }

                    // Historique (Buste)
                    const historyWrapper = document.getElementById('history-wrapper');
                    historyWrapper.innerHTML = ''; 

                    const skinTemplates = [
                        { label: "Actuel", date: "Aujourd'hui" },
                        { label: "#2", date: "Janv. 2026" },
                        { label: "#1", date: "Création" }
                    ];

                    skinTemplates.forEach((skin) => {
                        const card = document.createElement('div');
                        card.className = 'history-card';
                        card.innerHTML = \`
                            <div class="history-number">\${skin.label}</div>
                            <img src="https://mc-heads.net/player/\${data.uuid}/120" alt="Skin body">
                            <div class="history-date">\${skin.date}</div>
                        \`;
                        historyWrapper.appendChild(card);
                    });

                    document.getElementById('main-interface').style.display = 'grid';

                } catch (err) {
                    alert("Impossible de trouver ce joueur ou erreur serveur.");
                }
            }
        </script>
    </body>
    </html>
    `);
});

// 2. RECHERCHE DE JOUEUR (Bypass des restrictions Render via Ashcon)
app.get('/api/player/:pseudo', async (req, res) => {
    try {
        const name = req.params.pseudo;
        const response = await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`);
        
        if (!response.data || !response.data.uuid) {
            return res.status(404).json({ error: "Joueur introuvable" });
        }

        const data = response.data;
        const uuid = data.uuid.replace(/-/g, ''); // Format propre sans tirets pour correspondre à la BDD
        const exactPseudo = data.username;
        const skinUrl = data.textures?.skin?.url || null;
        const capeUrl = data.textures?.cape?.url || null;

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
        res.status(500).json({ error: "Erreur lors de la récupération du profil Mojang." });
    }
});

// 3. RECEPTION DES REQUÊTES DU MOD JAR
app.post('/api/update-stats', (req, res) => {
    const { uuid, serverIp, playTimeDelta } = req.body;
    if(!uuid) return res.status(400).send("UUID manquant");
    
    // Nettoyage de l'UUID envoyé par le mod au cas où il contient des tirets
    const cleanUuid = uuid.replace(/-/g, '');

    if(!database[cleanUuid]) {
        database[cleanUuid] = { totalTime: 0, lastServer: "", lastLogin: "" };
    }
    
    database[cleanUuid].totalTime += playTimeDelta;
    database[cleanUuid].lastServer = serverIp || "Solo / Local";
    database[cleanUuid].lastLogin = new Date().toLocaleDateString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    console.log(`[MOD SINC] Données reçues pour ${cleanUuid} : +${playTimeDelta} min sur ${serverIp}`);
    res.status(200).send("Stats mises à jour avec succès !");
});

// 4. OUVERTURE DU PORT SERVEUR
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
