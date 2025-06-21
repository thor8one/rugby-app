const rugbyField = document.getElementById('rugbyField');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const addOpponentBtn = document.getElementById('addOpponentBtn');
const addBallBtn = document.getElementById('addBallBtn');
const addPostsBtn = document.getElementById('addPostsBtn');
const addConeBtn = document.getElementById('addConeBtn');
const addPoleBtn = document.getElementById('addPoleBtn');
const addShieldBtn = document.getElementById('addShieldBtn');
const addBoudinBtn = document.getElementById('addBoudinBtn');
const clearFieldBtn = document.getElementById('clearFieldBtn');
const captureFrameBtn = document.getElementById('captureFrameBtn');
const startAnimationBtn = document.getElementById('startAnimationBtn');
const stopAnimationBtn = document.getElementById('stopAnimationBtn');
const exportGifBtn = document.getElementById('exportGifBtn');

// Tableaux pour stocker les références aux éléments ajoutés
let players = [];
let opponents = [];
let ball = null; // Un seul ballon
let rugbyPosts = null; // Un seul jeu de poteaux
let cones = [];
let poles = [];
let shields = [];
let boudins = [];

// Variables pour le glisser-déposer
let selectedElement = null; // L'élément actuellement glissé
let offsetX, offsetY; // Décalage du curseur par rapport au coin de l'élément

// Variables pour l'animation
let animationFrames = []; // Stocke toutes les "captures" de positions
let animationInterval = null; // Gère la boucle d'animation (setInterval)
let currentFrameIndex = 0; // Index de la frame en cours de lecture

// Compteurs pour les identifiants des éléments
let playerCounter = 1;
let opponentCounter = 1;
let coneCounter = 1;
let poleCounter = 1;
let shieldCounter = 1;
let boudinCounter = 1;

// --- Fonctions pour ajouter des éléments ---

function addPlayer() {
    const player = document.createElement('div');
    player.classList.add('player');
    player.textContent = playerCounter++;
    player.style.left = `${Math.random() * (rugbyField.offsetWidth - 30)}px`;
    player.style.top = `${Math.random() * (rugbyField.offsetHeight - 30)}px`;
    rugbyField.appendChild(player);
    players.push(player);
    makeDraggable(player);
}

function addOpponent() {
    const opponent = document.createElement('div');
    opponent.classList.add('opponent');
    opponent.textContent = 'O' + opponentCounter++;
    opponent.style.left = `${Math.random() * (rugbyField.offsetWidth - 30)}px`;
    opponent.style.top = `${Math.random() * (rugbyField.offsetHeight - 30)}px`;
    rugbyField.appendChild(opponent);
    opponents.push(opponent);
    makeDraggable(opponent);
}

function addBall() {
    if (ball) {
        alert("Il ne peut y avoir qu'un seul ballon sur le terrain.");
        return;
    }
    ball = document.createElement('div');
    ball.classList.add('ball');
    ball.textContent = 'B';
    // Positions par défaut pour le ballon, ajustez si besoin
    ball.style.left = `${Math.random() * (rugbyField.offsetWidth - 20)}px`;
    ball.style.top = `${Math.random() * (rugbyField.offsetHeight - 20)}px`;
    rugbyField.appendChild(ball);
    makeDraggable(ball);
}

function addPosts() {
    if (rugbyPosts) {
        alert("Il ne peut y avoir qu'un seul jeu de poteaux sur le terrain.");
        return;
    }
    rugbyPosts = document.createElement('div');
    rugbyPosts.classList.add('rugby-posts');
    rugbyPosts.textContent = 'Poteaux';
    rugbyPosts.style.left = `${(rugbyField.offsetWidth / 2) - 20}px`; // Centré horizontalement
    rugbyPosts.style.top = `0px`; // En haut du terrain
    rugbyField.appendChild(rugbyPosts);
    makeDraggable(rugbyPosts);
}

function addCone() {
    const cone = document.createElement('div');
    cone.classList.add('training-cone');
    cone.textContent = 'C' + coneCounter++;
    cone.style.left = `${Math.random() * (rugbyField.offsetWidth - 25)}px`;
    cone.style.top = `${Math.random() * (rugbyField.offsetHeight - 25)}px`;
    rugbyField.appendChild(cone);
    cones.push(cone);
    makeDraggable(cone);
}

function addPole() {
    const pole = document.createElement('div');
    pole.classList.add('training-pole');
    pole.textContent = 'P' + poleCounter++;
    pole.style.left = `${Math.random() * (rugbyField.offsetWidth - 10)}px`;
    pole.style.top = `${Math.random() * (rugbyField.offsetHeight - 40)}px`;
    rugbyField.appendChild(pole);
    poles.push(pole);
    makeDraggable(pole);
}

function addShield() {
    const shield = document.createElement('div');
    shield.classList.add('training-shield');
    shield.textContent = 'S' + shieldCounter++;
    shield.style.left = `${Math.random() * (rugbyField.offsetWidth - 60)}px`;
    shield.style.top = `${Math.random() * (rugbyField.offsetHeight - 40)}px`;
    rugbyField.appendChild(shield);
    shields.push(shield);
    makeDraggable(shield);
}

function addBoudin() {
    const boudin = document.createElement('div');
    boudin.classList.add('training-boudin');
    boudin.textContent = 'B' + boudinCounter++;
    boudin.style.left = `${Math.random() * (rugbyField.offsetWidth - 80)}px`;
    boudin.style.top = `${Math.random() * (rugbyField.offsetHeight - 30)}px`;
    rugbyField.appendChild(boudin);
    boudins.push(boudin);
    makeDraggable(boudin);
}

// --- Fonction pour effacer tous les éléments du terrain ---
function clearField() {
    rugbyField.innerHTML = ''; // Vide tout le contenu HTML du terrain
    // Réinitialise tous les tableaux et variables de référence
    players = [];
    opponents = [];
    ball = null;
    rugbyPosts = null;
    cones = [];
    poles = [];
    shields = [];
    boudins = [];

    // Réinitialise les compteurs pour les futurs ajouts
    playerCounter = 1;
    opponentCounter = 1;
    coneCounter = 1;
    poleCounter = 1;
    shieldCounter = 1;
    boudinCounter = 1;

    animationFrames = []; // Très important : vider les frames d'animation enregistrées
    stopAnimation(); // Arrête toute animation en cours
    console.log("Terrain effacé et frames d'animation réinitialisées.");
}

// --- Fonctions de glisser-déposer pour rendre les éléments interactifs (Souris et Tactile) ---

function makeDraggable(element) {
    // Gestion des événements de SOURIS
    element.addEventListener('mousedown', (e) => {
        selectedElement = element;
        offsetX = e.clientX - selectedElement.getBoundingClientRect().left;
        offsetY = e.clientY - selectedElement.getBoundingClientRect().top;
        selectedElement.style.cursor = 'grabbing';
    });

    // Gestion des événements TACTILES
    element.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Empêche le défilement/zoom par défaut
        selectedElement = element;
        offsetX = e.touches[0].clientX - selectedElement.getBoundingClientRect().left;
        offsetY = e.touches[0].clientY - selectedElement.getBoundingClientRect().top;
    });
}

// Gestion des événements de déplacement (SOURIS)
document.addEventListener('mousemove', (e) => {
    if (!selectedElement) return;
    e.preventDefault();
    let newX = e.clientX - offsetX - rugbyField.getBoundingClientRect().left;
    let newY = e.clientY - offsetY - rugbyField.getBoundingClientRect().top;

    newX = Math.max(0, Math.min(newX, rugbyField.offsetWidth - selectedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, rugbyField.offsetHeight - selectedElement.offsetHeight));

    selectedElement.style.left = `${newX}px`;
    selectedElement.style.top = `${newY}px`;
});

// Gestion des événements de déplacement (TACTILE)
document.addEventListener('touchmove', (e) => {
    if (!selectedElement) return;
    e.preventDefault(); // Empêche le défilement de la page pendant le glisser

    let newX = e.touches[0].clientX - offsetX - rugbyField.getBoundingClientRect().left;
    let newY = e.touches[0].clientY - offsetY - rugbyField.getBoundingClientRect().top;

    newX = Math.max(0, Math.min(newX, rugbyField.offsetWidth - selectedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, rugbyField.offsetHeight - selectedElement.offsetHeight));

    selectedElement.style.left = `${newX}px`;
    selectedElement.style.top = `${newY}px`;
});


// Gestion des événements de fin de glisser (SOURIS)
document.addEventListener('mouseup', () => {
    if (selectedElement) {
        selectedElement.style.cursor = 'grab';
        selectedElement = null;
    }
});

// Gestion de la fin du glisser (TACTILE)
document.addEventListener('touchend', () => {
    if (selectedElement) {
        selectedElement = null;
    }
});


// --- Fonctions d'animation : Capture et Lecture des frames ---

function captureFrame() {
    // Vérifie s'il y a au moins un élément à capturer pour éviter les frames vides
    if (players.length === 0 && opponents.length === 0 && !ball && !rugbyPosts &&
        cones.length === 0 && poles.length === 0 && shields.length === 0 && boudins.length === 0) {
        alert("Aucun élément sur le terrain à capturer pour cette frame.");
        return;
    }

    // Crée un objet 'frame' qui contient les positions de tous les éléments à ce moment précis
    const frame = {
        players: players.map(p => ({
            id: p.textContent,
            left: p.style.left,
            top: p.style.top
        })),
        opponents: opponents.map(o => ({
            id: o.textContent,
            left: o.style.left,
            top: o.style.top
        })),
        ball: ball ? {
            left: ball.style.left,
            top: ball.style.top
        } : null,
        rugbyPosts: rugbyPosts ? {
            left: rugbyPosts.style.left,
            top: rugbyPosts.style.top
        } : null,
        cones: cones.map(c => ({
            id: c.textContent,
            left: c.style.left,
            top: c.style.top
        })),
        poles: poles.map(p => ({
            id: p.textContent,
            left: p.style.left,
            top: p.style.top
        })),
        shields: shields.map(s => ({
            id: s.textContent,
            left: s.style.left,
            top: s.style.top
        })),
        boudins: boudins.map(b => ({
            id: b.textContent,
            left: b.style.left,
            top: b.style.top
        }))
    };
    animationFrames.push(frame); // Ajoute la frame à la liste des frames d'animation
    console.log(`Frame capturée. Total frames: ${animationFrames.length}`);
}

function applyFrame(frame) {
    // Applique la position de chaque joueur
    frame.players.forEach(pData => {
        const playerDiv = players.find(p => p.textContent === pData.id);
        if (playerDiv) {
            playerDiv.style.left = pData.left;
            playerDiv.style.top = pData.top;
        }
    });
    // Applique la position de chaque opposant
    frame.opponents.forEach(oData => {
        const opponentDiv = opponents.find(o => o.textContent === oData.id);
        if (opponentDiv) {
            opponentDiv.style.left = oData.left;
            opponentDiv.style.top = oData.top;
        }
    });
    // Applique la position du ballon
    if (frame.ball && ball) {
        ball.style.left = frame.ball.left;
        ball.style.top = frame.ball.top;
    }
    // Applique la position des poteaux
    if (frame.rugbyPosts && rugbyPosts) {
        rugbyPosts.style.left = frame.rugbyPosts.left;
        rugbyPosts.style.top = frame.rugbyPosts.top;
    }
    // Applique la position de chaque plot
    frame.cones.forEach(cData => {
        const coneDiv = cones.find(c => c.textContent === cData.id);
        if (coneDiv) {
            coneDiv.style.left = cData.left;
            coneDiv.style.top = cData.top;
        }
    });
    // Applique la position de chaque piquet
    frame.poles.forEach(pData => {
        const poleDiv = poles.find(p => p.textContent === pData.id);
        if (poleDiv) {
            poleDiv.style.left = pData.left;
            poleDiv.style.top = pData.top;
        }
    });
    // Applique la position de chaque bouclier
    frame.shields.forEach(sData => {
        const shieldDiv = shields.find(s => s.textContent === sData.id);
        if (shieldDiv) {
            shieldDiv.style.left = sData.left;
            shieldDiv.style.top = sData.top;
        }
    });
    // Applique la position de chaque boudin
    frame.boudins.forEach(bData => {
        const boudinDiv = boudins.find(b => b.textContent === bData.id);
        if (boudinDiv) {
            boudinDiv.style.left = bData.left;
            boudinDiv.style.top = bData.top;
        }
    });
}

function startAnimation(isExporting = false) {
    if (animationFrames.length < 2) {
        alert("Veuillez capturer au moins 2 'frames' pour lancer l'animation ou l'export.");
        return isExporting ? Promise.reject("Not enough frames") : null;
    }

    if (!isExporting) {
        stopAnimation(); // S'assure qu'aucune animation n'est déjà en cours
    } else {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    // Réinitialisation complète du terrain et recréation des éléments
    rugbyField.innerHTML = '';
    players = [];
    opponents = [];
    ball = null;
    rugbyPosts = null;
    cones = [];
    poles = [];
    shields = [];
    boudins = [];

    if (!isExporting) {
        playerCounter = 1;
        opponentCounter = 1;
        coneCounter = 1;
        poleCounter = 1;
        shieldCounter = 1;
        boudinCounter = 1;
    }

    const firstFrame = animationFrames[0];

    // Recréation des joueurs
    firstFrame.players.forEach(pData => {
        const player = document.createElement('div');
        player.classList.add('player');
        player.textContent = pData.id;
        player.style.left = pData.left;
        player.style.top = pData.top;
        rugbyField.appendChild(player);
        players.push(player);
        if(!isExporting) makeDraggable(player);
    });

    // Recréation des opposants
    firstFrame.opponents.forEach(oData => {
        const opponent = document.createElement('div');
        opponent.classList.add('opponent');
        opponent.textContent = oData.id;
        opponent.style.left = oData.left;
        opponent.style.top = oData.top;
        rugbyField.appendChild(opponent);
        opponents.push(opponent);
        if(!isExporting) makeDraggable(opponent);
    });

    // Recréation du ballon
    if (firstFrame.ball) {
        ball = document.createElement('div');
        ball.classList.add('ball');
        ball.textContent = 'B';
        ball.style.left = firstFrame.ball.left;
        ball.style.top = firstFrame.ball.top;
        rugbyField.appendChild(ball);
        if(!isExporting) makeDraggable(ball);
    }

    // Recréation des poteaux
    if (firstFrame.rugbyPosts) {
        rugbyPosts = document.createElement('div');
        rugbyPosts.classList.add('rugby-posts');
        rugbyPosts.textContent = 'Poteaux';
        rugbyPosts.style.left = firstFrame.rugbyPosts.left;
        rugbyPosts.style.top = firstFrame.rugbyPosts.top;
        rugbyField.appendChild(rugbyPosts);
        if(!isExporting) makeDraggable(rugbyPosts);
    }

    // Recréation des plots
    firstFrame.cones.forEach(cData => {
        const cone = document.createElement('div');
        cone.classList.add('training-cone');
        cone.textContent = cData.id;
        cone.style.left = cData.left;
        cone.style.top = cData.top;
        rugbyField.appendChild(cone);
        cones.push(cone);
        if(!isExporting) makeDraggable(cone);
    });

    // Recréation des piquets
    firstFrame.poles.forEach(pData => {
        const pole = document.createElement('div');
        pole.classList.add('training-pole');
        pole.textContent = pData.id;
        pole.style.left = pData.left;
        pole.style.top = pData.top;
        rugbyField.appendChild(pole);
        poles.push(pole);
        if(!isExporting) makeDraggable(pole);
    });

    // Recréation des boucliers
    firstFrame.shields.forEach(sData => {
        const shield = document.createElement('div');
        shield.classList.add('training-shield');
        shield.textContent = sData.id;
        shield.style.left = sData.left;
        shield.style.top = sData.top;
        rugbyField.appendChild(shield);
        shields.push(shield);
        if(!isExporting) makeDraggable(shield);
    });

    // Recréation des boudins
    firstFrame.boudins.forEach(bData => {
        const boudin = document.createElement('div');
        boudin.classList.add('training-boudin');
        boudin.textContent = bData.id;
        boudin.style.left = bData.left;
        boudin.style.top = bData.top;
        rugbyField.appendChild(boudin);
        boudins.push(boudin);
        if(!isExporting) makeDraggable(boudin);
    });

    currentFrameIndex = 0;
    applyFrame(animationFrames[currentFrameIndex]);

    const animationSpeed = 500; // La vitesse d'animation (en ms)

    if (!isExporting) {
        animationInterval = setInterval(() => {
            currentFrameIndex++;
            if (currentFrameIndex < animationFrames.length) {
                applyFrame(animationFrames[currentFrameIndex]);
            } else {
                currentFrameIndex = 0; // Boucle l'animation normale
                applyFrame(animationFrames[currentFrameIndex]);
            }
        }, animationSpeed);
        console.log("Animation démarrée.");
        return null;
    } else {
        return new Promise(resolve => {
            // Pour l'export, on ne veut pas un intervalle continu.
            // On veut juste que le terrain soit dans l'état de la première frame
            // pour la première capture, puis la logique d'export appellera applyFrame
            // pour chaque frame avant de la capturer.
            resolve("Initial setup for export complete");
        });
    }
}


function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
        console.log("Animation arrêtée.");
    }
}

// --- Nouvelle fonction pour exporter le GIF ---
async function exportGif() {
    if (animationFrames.length < 2) {
        alert("Veuillez capturer au moins 2 'frames' pour exporter l'animation.");
        return;
    }

    exportGifBtn.disabled = true;
    exportGifBtn.textContent = 'Génération GIF...';

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js', // Assurez-vous que le chemin est correct ici
        width: rugbyField.offsetWidth,
        height: rugbyField.offsetHeight,
        transparent: '#7CFC00' // Si vous voulez rendre la couleur du terrain transparente (optionnel)
    });

    console.log("Démarrage de l'exportation GIF...");

    const animationSpeed = 500; // Doit correspondre à la vitesse définie dans startAnimation

    // S'assurer que le terrain est prêt et que les éléments sont recréés à partir de la première frame
    try {
        await startAnimation(true); // Re-initialise le terrain et met les éléments à la frame 0
    } catch (error) {
        console.error("Erreur lors de la préparation de l'animation pour l'export:", error);
        exportGifBtn.disabled = false;
        exportGifBtn.textContent = 'Exporter GIF';
        return;
    }

    let promises = [];
    for (let i = 0; i < animationFrames.length; i++) {
        // Appliquer la frame
        applyFrame(animationFrames[i]);

        // Délai pour que le rendu se fasse AVANT la capture
        // Ce setTimeout est critique pour laisser le navigateur rendre les éléments à leurs nouvelles positions
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capturer le canvas après que la frame soit appliquée et rendue
        const promise = html2canvas(rugbyField, {
            scale: 1, // Capture à la taille réelle
            useCORS: true // Nécessaire si vous avez des images d'autres origines
        }).then(canvas => {
            gif.addFrame(canvas.getContext('2d'), { delay: animationSpeed }); // Ajoute la frame avec le délai
            console.log(`Frame ${i + 1}/${animationFrames.length} capturée pour GIF.`);
        }).catch(err => {
            console.error(`Erreur de capture de frame ${i} pour GIF:`, err);
        });
        promises.push(promise);
    }

    await Promise.all(promises); // Attend que toutes les captures soient terminées

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation_rugby.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libère la mémoire

        exportGifBtn.disabled = false;
        exportGifBtn.textContent = 'Exporter GIF';
        console.log("GIF exporté avec succès !");
    });

    gif.on('progress', function(p) {
        exportGifBtn.textContent = `Génération GIF... ${(p * 100).toFixed(0)}%`;
    });

    gif.on('error', function(err) {
        console.error("Erreur lors de la génération du GIF:", err);
        alert("Une erreur est survenue lors de l'exportation du GIF. Vérifiez la console pour plus de détails.");
        exportGifBtn.disabled = false;
        exportGifBtn.textContent = 'Exporter GIF';
    });

    gif.render(); // Démarre le processus de rendu du GIF
}


// --- Écouteurs d'événements pour les boutons : Lient les clics aux fonctions ---
addPlayerBtn.addEventListener('click', addPlayer);
addOpponentBtn.addEventListener('click', addOpponent);
addBallBtn.addEventListener('click', addBall);
addPostsBtn.addEventListener('click', addPosts);
addConeBtn.addEventListener('click', addCone);
addPoleBtn.addEventListener('click', addPole);
addShieldBtn.addEventListener('click', addShield);
addBoudinBtn.addEventListener('click', addBoudin);
clearFieldBtn.addEventListener('click', clearField);
captureFrameBtn.addEventListener('click', captureFrame);
startAnimationBtn.addEventListener('click', () => startAnimation(false)); // Lance l'animation normale
stopAnimationBtn.addEventListener('click', stopAnimation);
exportGifBtn.addEventListener('click', exportGif); // Lie le bouton d'export