// --- Références aux éléments (assurez-vous que ces IDs correspondent à votre index.html) ---
const rugbyField = document.getElementById('rugby-field');
const addPlayerBtn = document.getElementById('addPlayer');
const addOpponentBtn = document.getElementById('addOpponent');
const addBallBtn = document.getElementById('addBall');
const addPostsBtn = document.getElementById('addPosts');
const addConeBtn = document.getElementById('addCone');
const addPoleBtn = document.getElementById('addPole');
const addShieldBtn = document.getElementById('addShield');
const addBoudinBtn = document.getElementById('addBoudin');
const clearFieldBtn = document.getElementById('clearField');
const captureFrameBtn = document.getElementById('captureFrame');
const startAnimationBtn = document.getElementById('startAnimation');
const stopAnimationBtn = document.getElementById('stopAnimation');
const exportGifBtn = document.getElementById('exportGif');

// --- Variables globales ---
let players = [];
let opponents = [];
let ball = null;
let rugbyPosts = null;
let cones = [];
let poles = [];
let shields = [];
let boudins = [];

// Variables pour le glisser-déposer
let draggedElement = null; // L'élément actuellement glissé
let offsetX, offsetY; // Décalage du curseur/doigt par rapport au coin de l'élément

// Variables pour la sélection et la suppression
let selectedDraggableElement = null; // L'élément actuellement sélectionné (pour suppression, style)
let currentDeleteButton = null;      // L'élément DOM du bouton de suppression

// Variables pour l'animation
let animationFrames = [];
let animationInterval = null;
let currentFrameIndex = 0;

// Compteurs pour les IDs uniques (pour générer des IDs comme 'player-1', 'cone-3', etc.)
let playerCounter = 1;
let opponentCounter = 1;
let coneCounter = 1;
let poleCounter = 1;
let shieldCounter = 1;
let boudinCounter = 1;

// --- Fonctions utilitaires pour la sélection et la suppression ---

/**
 * Sélectionne un élément donné, applique la classe 'selected', et affiche un bouton de suppression.
 * Désélectionne tout élément précédemment sélectionné.
 * @param {HTMLElement|null} elementToSelect - L'élément à sélectionner, ou null pour tout désélectionner.
 */
/**
 * Sélectionne un élément donné, applique la classe 'selected', et affiche un bouton de suppression.
 * Désélectionne tout élément précédemment sélectionné.
 * @param {HTMLElement|null} elementToSelect - L'élément à sélectionner, ou null pour tout désélectionner.
 */
function selectDraggableElement(elementToSelect) {
    console.log("--- Début de selectDraggableElement ---");
    console.log("elementToSelect:", elementToSelect);
    console.log("selectedDraggableElement (avant):", selectedDraggableElement);
    console.log("currentDeleteButton (avant):", currentDeleteButton);


    // Si un élément était précédemment sélectionné, le désélectionner et retirer son bouton de suppression
    if (selectedDraggableElement && selectedDraggableElement !== elementToSelect) {
        console.log("Désélection d'un élément précédent.");
        selectedDraggableElement.classList.remove('selected');
        if (currentDeleteButton) {
            console.log("Suppression de l'ancien bouton de suppression.");
            currentDeleteButton.remove();
            currentDeleteButton = null;
        }
    }

    // Sélectionne le nouvel élément si un élément valide est fourni
    if (elementToSelect) {
        console.log("Un nouvel elementToSelect est fourni.");
        // Si l'élément est déjà sélectionné, le désélectionner (clic sur un élément déjà sélectionné)
        if (selectedDraggableElement === elementToSelect) {
            console.log("L'élément est déjà sélectionné, désélection.");
            elementToSelect.classList.remove('selected');
            if (currentDeleteButton) {
                currentDeleteButton.remove();
            }
            selectedDraggableElement = null;
            currentDeleteButton = null;
            console.log("--- Fin de selectDraggableElement (désélection) ---");
            return; // Sortir après désélection
        }

        selectedDraggableElement = elementToSelect;
        selectedDraggableElement.classList.add('selected');
        console.log("Élément maintenant sélectionné:", selectedDraggableElement);


        // --- SECTION CRUCIALE : CRÉATION DU BOUTON ---
        currentDeleteButton = document.createElement('div');
        console.log("Bouton de suppression créé:", currentDeleteButton); // Devrait s'afficher
        currentDeleteButton.classList.add('delete-button');
        currentDeleteButton.innerHTML = '&times;'; // Symbole "X"

        // Positionne le bouton par rapport à l'élément sélectionné.
        currentDeleteButton.style.position = 'absolute';
        currentDeleteButton.style.right = '-10px';
        currentDeleteButton.style.top = '-10px';
        currentDeleteButton.style.zIndex = '101';

        console.log("Tentative d'ajout du bouton au DOM..."); // Devrait s'afficher
        selectedDraggableElement.appendChild(currentDeleteButton);
        console.log("Bouton de suppression ajouté au DOM."); // DEVRAIT S'AFFICHER APRÈS SUCCÈS

        // Écouteur d'événement pour le bouton de suppression
        currentDeleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Clic sur le bouton de suppression détecté via l'écouteur JS !"); // NOUVEAU LOG POUR LE CLIC
            deleteSelectedElement();
        });
        console.log("Écouteur d'événement ajouté au bouton de suppression.");

    } else {
        // Si elementToSelect est null, cela signifie qu'on veut juste désélectionner tout
        console.log("elementToSelect est null, désélection de tout.");
        selectedDraggableElement = null;
        currentDeleteButton = null;
    }
    console.log("--- Fin de selectDraggableElement ---");
}
/**
 * Désélectionne tous les éléments et supprime le bouton de suppression.
 */
function deselectAllElements() {
    if (selectedDraggableElement) {
        selectedDraggableElement.classList.remove('selected');
    }
    if (currentDeleteButton) {
        currentDeleteButton.remove();
    }
    selectedDraggableElement = null;
    currentDeleteButton = null;
}

/**
 * Supprime l'élément actuellement sélectionné après confirmation.
 */
function deleteSelectedElement() {
    if (selectedDraggableElement) {
        if (confirm("Voulez-vous vraiment supprimer l'élément sélectionné ?")) {
            // Retirer l'élément du DOM
            selectedDraggableElement.remove();

            // Retirer l'élément de nos tableaux de suivi par son ID
            const elementId = selectedDraggableElement.id;
            if (elementId.startsWith('player')) {
                players = players.filter(p => p.id !== elementId);
            } else if (elementId.startsWith('opponent')) {
                opponents = opponents.filter(o => o.id !== elementId);
            } else if (elementId === 'ball') {
                ball = null;
            } else if (elementId === 'rugbyPosts') {
                rugbyPosts = null;
            } else if (elementId.startsWith('cone')) {
                cones = cones.filter(c => c.id !== elementId);
            } else if (elementId.startsWith('pole')) {
                poles = poles.filter(p => p.id !== elementId);
            } else if (elementId.startsWith('shield')) {
                shields = shields.filter(s => s.id !== elementId);
            } else if (elementId.startsWith('boudin')) {
                boudins = boudins.filter(b => b.id !== elementId);
            }

            deselectAllElements(); // Désélectionne l'élément après suppression
            console.log(`Élément ${elementId} supprimé.`);
        }
    } else {
        console.log("Aucun élément sélectionné à supprimer.");
    }
}

// --- Fonctions pour ajouter des éléments ---

function addPlayer() {
    const player = document.createElement('div');
    player.id = `player-${playerCounter}`; // Attribuer un ID unique comme 'player-1', 'player-2'
    player.classList.add('player');
    player.textContent = `P${playerCounter}`; // Texte affiché : P1, P2...
    playerCounter++; // Incrémenter le compteur après l'avoir utilisé
    player.style.left = `${Math.random() * (rugbyField.offsetWidth - 40)}px`; // Ajuster pour la taille
    player.style.top = `${Math.random() * (rugbyField.offsetHeight - 40)}px`; // Ajuster pour la taille
    rugbyField.appendChild(player);
    players.push(player);
    makeDraggable(player);
    selectDraggableElement(player); // Sélectionne le nouvel élément après l'avoir ajouté
}

function addOpponent() {
    const opponent = document.createElement('div');
    opponent.id = `opponent-${opponentCounter}`;
    opponent.classList.add('opponent');
    opponent.textContent = `O${opponentCounter}`; // Texte affiché : O1, O2...
    opponentCounter++;
    opponent.style.left = `${Math.random() * (rugbyField.offsetWidth - 40)}px`;
    opponent.style.top = `${Math.random() * (rugbyField.offsetHeight - 40)}px`;
    rugbyField.appendChild(opponent);
    opponents.push(opponent);
    makeDraggable(opponent);
    selectDraggableElement(opponent);
}

function addBall() {
    if (ball) {
        alert("Il ne peut y avoir qu'un seul ballon sur le terrain.");
        return;
    }
    ball = document.createElement('div');
    ball.id = 'ball'; // ID unique pour le ballon
    ball.classList.add('ball');
    ball.textContent = 'B';
    ball.style.left = `${Math.random() * (rugbyField.offsetWidth - 30)}px`; // Ajuster taille
    ball.style.top = `${Math.random() * (rugbyField.offsetHeight - 30)}px`; // Ajuster taille
    rugbyField.appendChild(ball);
    makeDraggable(ball);
    selectDraggableElement(ball);
}

function addPosts() {
    if (rugbyPosts) {
        alert("Il ne peut y avoir qu'un seul jeu de poteaux sur le terrain.");
        return;
    }
    rugbyPosts = document.createElement('div');
    rugbyPosts.id = 'rugbyPosts'; // ID unique pour les poteaux
    rugbyPosts.classList.add('rugby-posts');
    rugbyPosts.textContent = 'Poteaux';
    rugbyPosts.style.left = `${(rugbyField.offsetWidth / 2) - 40}px`; // Centré horizontalement, ajuster taille
    rugbyPosts.style.top = `0px`; // En haut du terrain
    rugbyField.appendChild(rugbyPosts);
    makeDraggable(rugbyPosts);
    selectDraggableElement(rugbyPosts);
}

function addCone() {
    const cone = document.createElement('div');
    cone.id = `cone-${coneCounter}`;
    cone.classList.add('training-cone');
    cone.textContent = `C${coneCounter}`; // Texte affiché : C1, C2...
    coneCounter++;
    cone.style.left = `${Math.random() * (rugbyField.offsetWidth - 30)}px`;
    cone.style.top = `${Math.random() * (rugbyField.offsetHeight - 30)}px`;
    rugbyField.appendChild(cone);
    cones.push(cone);
    makeDraggable(cone);
    selectDraggableElement(cone);
}

function addPole() {
    const pole = document.createElement('div');
    pole.id = `pole-${poleCounter}`;
    pole.classList.add('training-pole');
    pole.textContent = `P${poleCounter}`; // Texte affiché : P1, P2...
    poleCounter++;
    pole.style.left = `${Math.random() * (rugbyField.offsetWidth - 20)}px`;
    pole.style.top = `${Math.random() * (rugbyField.offsetHeight - 50)}px`;
    rugbyField.appendChild(pole);
    poles.push(pole);
    makeDraggable(pole);
    selectDraggableElement(pole);
}

function addShield() {
    const shield = document.createElement('div');
    shield.id = `shield-${shieldCounter}`;
    shield.classList.add('training-shield');
    shield.textContent = `S${shieldCounter}`; // Texte affiché : S1, S2...
    shieldCounter++;
    shield.style.left = `${Math.random() * (rugbyField.offsetWidth - 70)}px`;
    shield.style.top = `${Math.random() * (rugbyField.offsetHeight - 50)}px`;
    rugbyField.appendChild(shield);
    shields.push(shield);
    makeDraggable(shield);
    selectDraggableElement(shield);
}

function addBoudin() {
    const boudin = document.createElement('div');
    boudin.id = `boudin-${boudinCounter}`;
    boudin.classList.add('training-boudin');
    boudin.textContent = `B${boudinCounter}`; // Texte affiché : B1, B2...
    boudinCounter++;
    boudin.style.left = `${Math.random() * (rugbyField.offsetWidth - 90)}px`;
    boudin.style.top = `${Math.random() * (rugbyField.offsetHeight - 40)}px`;
    rugbyField.appendChild(boudin);
    boudins.push(boudin);
    makeDraggable(boudin);
    selectDraggableElement(boudin);
}

// --- Fonction pour effacer tous les éléments du terrain ---
function clearField() {
    if (confirm("Voulez-vous vraiment vider tout le terrain ?")) {
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

        // Réinitialise les compteurs pour les futurs ajouts (important pour les IDs uniques)
        playerCounter = 1;
        opponentCounter = 1;
        coneCounter = 1;
        poleCounter = 1;
        shieldCounter = 1;
        boudinCounter = 1;

        animationFrames = []; // Très important : vider les frames d'animation enregistrées
        stopAnimation(); // Arrête toute animation en cours
        deselectAllElements(); // Désélectionne tout après l'effacement
        console.log("Terrain effacé et frames d'animation réinitialisées.");
    }
}

// --- Fonctions de glisser-déposer pour rendre les éléments interactifs (Souris et Tactile) ---

function makeDraggable(element) {
    // Gestion des événements de SOURIS
    element.addEventListener('mousedown', (e) => {
        // Empêche le clic de se propager au document ou au terrain.
        // Si le clic vient du bouton de suppression, on ne veut pas déclencher le glisser-déposer.
        if (e.target.classList.contains('delete-button')) {
            console.log("Clic sur le bouton de suppression, annulation du mousedown du draggable.");
            return; // N'active pas le glisser-déposer si le clic est sur la croix
        }
        
        e.stopPropagation(); // Toujours nécessaire pour éviter la propagation à des parents plus lointains

        selectDraggableElement(element); // Sélectionne l'élément quand le glisser commence

        draggedElement = element;
        // Calcule le décalage initial du curseur par rapport au coin supérieur gauche de l'élément
        const rect = draggedElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        draggedElement.style.cursor = 'grabbing';
    });

    // Ajoutez un écouteur de 'click' sur l'élément déplaçable pour être sûr que la propagation est stoppée
    // Ceci est une mesure de précaution.
    element.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            e.stopPropagation(); // Assure que le clic sur la croix ne se propage pas au parent
            console.log("Propagation du clic sur la croix arrêtée par l'écouteur du draggable.");
            return;
        }
        // Pour les autres clics sur l'élément, ne rien faire de spécial ou laisser le selectDraggableElement gérer
        // e.stopPropagation(); // Ne pas stopper pour d'autres clics sur l'élément, sauf si c'est la croix
    });

    // Gestion des événements TACTILES
    element.addEventListener('touchstart', (e) => {
        // Idem pour le tactile
        if (e.target.classList.contains('delete-button')) {
            console.log("Touch sur le bouton de suppression, annulation du touchstart du draggable.");
            return;
        }

        e.stopPropagation(); // Empêche l'événement tactile de se propager au document
        e.preventDefault(); // Empêche le défilement/zoom par défaut
        
        selectDraggableElement(element); // Sélectionne l'élément quand le glisser commence

        draggedElement = element;
        let touch = e.touches[0]; // Prend le premier doigt touché
        const rect = draggedElement.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
    });
}
// Gestion des événements de déplacement (SOURIS)
document.addEventListener('mousemove', (e) => {
    if (!draggedElement) return;
    e.preventDefault(); // Empêche la sélection de texte ou d'autres comportements

    // Calcule la nouvelle position de l'élément
    let newX = e.clientX - offsetX - rugbyField.getBoundingClientRect().left;
    let newY = e.clientY - offsetY - rugbyField.getBoundingClientRect().top;

    // Limite le déplacement à l'intérieur des bords du terrain de rugby
    newX = Math.max(0, Math.min(newX, rugbyField.offsetWidth - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, rugbyField.offsetHeight - draggedElement.offsetHeight));

    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;
});

// Gestion des événements de déplacement (TACTILE)
document.addEventListener('touchmove', (e) => {
    if (!draggedElement) return;
    e.preventDefault(); // Empêche le défilement de la page pendant le glisser

    let touch = e.touches[0];
    let newX = touch.clientX - offsetX - rugbyField.getBoundingClientRect().left;
    let newY = touch.clientY - offsetY - rugbyField.getBoundingClientRect().top;

    // Limite le déplacement à l'intérieur des bords du terrain de rugby
    newX = Math.max(0, Math.min(newX, rugbyField.offsetWidth - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, rugbyField.offsetHeight - draggedElement.offsetHeight));

    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;
});

// Gestion des événements de fin de glisser (SOURIS)
document.addEventListener('mouseup', () => {
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement = null; // Réinitialise l'élément glissé
    }
});

// Gestion de la fin du glisser (TACTILE)
document.addEventListener('touchend', () => {
    if (draggedElement) {
        draggedElement = null; // Réinitialise l'élément glissé
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
            id: p.id, // Utilise l'ID de l'élément
            left: p.style.left,
            top: p.style.top
        })),
        opponents: opponents.map(o => ({
            id: o.id,
            left: o.style.left,
            top: o.style.top
        })),
        ball: ball ? {
            id: ball.id,
            left: ball.style.left,
            top: ball.style.top
        } : null,
        rugbyPosts: rugbyPosts ? {
            id: rugbyPosts.id,
            left: rugbyPosts.style.left,
            top: rugbyPosts.style.top
        } : null,
        cones: cones.map(c => ({
            id: c.id,
            left: c.style.left,
            top: c.style.top
        })),
        poles: poles.map(p => ({
            id: p.id,
            left: p.style.left,
            top: p.style.top
        })),
        shields: shields.map(s => ({
            id: s.id,
            left: s.style.left,
            top: s.style.top
        })),
        boudins: boudins.map(b => ({
            id: b.id,
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
        const playerDiv = document.getElementById(pData.id); // Recherche par ID
        if (playerDiv) {
            playerDiv.style.left = pData.left;
            playerDiv.style.top = pData.top;
        }
    });
    // Applique la position de chaque opposant
    frame.opponents.forEach(oData => {
        const opponentDiv = document.getElementById(oData.id); // Recherche par ID
        if (opponentDiv) {
            opponentDiv.style.left = oData.left;
            opponentDiv.style.top = oData.top;
        }
    });
    // Applique la position du ballon
    if (frame.ball && ball) { // Vérifie si le ballon existe dans la frame ET sur le terrain
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
        const coneDiv = document.getElementById(cData.id);
        if (coneDiv) {
            coneDiv.style.left = cData.left;
            coneDiv.style.top = cData.top;
        }
    });
    // Applique la position de chaque piquet
    frame.poles.forEach(pData => {
        const poleDiv = document.getElementById(pData.id);
        if (poleDiv) {
            poleDiv.style.left = pData.left;
            poleDiv.style.top = pData.top;
        }
    });
    // Applique la position de chaque bouclier
    frame.shields.forEach(sData => {
        const shieldDiv = document.getElementById(sData.id);
        if (shieldDiv) {
            shieldDiv.style.left = sData.left;
            shieldDiv.style.top = sData.top;
        }
    });
    // Applique la position de chaque boudin
    frame.boudins.forEach(bData => {
        const boudinDiv = document.getElementById(bData.id);
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
        deselectAllElements(); // Désélectionne les éléments pendant l'animation
    } else {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    // Réinitialisation complète du terrain et recréation des éléments
    rugbyField.innerHTML = '';
    // IMPORTANT : Ne pas réinitialiser les compteurs ici si on exporte, car ils sont utilisés pour les IDs.
    // Les compteurs sont réinitialisés seulement lors de clearField().
    players = [];
    opponents = [];
    ball = null;
    rugbyPosts = null;
    cones = [];
    poles = [];
    shields = [];
    boudins = [];

    const firstFrame = animationFrames[0];

    // Recréation des joueurs
    firstFrame.players.forEach(pData => {
        const player = document.createElement('div');
        player.id = pData.id;
        player.classList.add('player');
        // Le texte affiché doit correspondre à l'ID pour que applyFrame le retrouve si besoin
        player.textContent = pData.id.replace('player-', 'P'); // Ex: "P1", "P2"
        player.style.left = pData.left;
        player.style.top = pData.top;
        rugbyField.appendChild(player);
        players.push(player);
        if(!isExporting) makeDraggable(player); // Les éléments ne doivent pas être déplaçables pendant l'animation/export
    });

    // Recréation des opposants
    firstFrame.opponents.forEach(oData => {
        const opponent = document.createElement('div');
        opponent.id = oData.id;
        opponent.classList.add('opponent');
        opponent.textContent = oData.id.replace('opponent-', 'O'); // Ex: "O1", "O2"
        opponent.style.left = oData.left;
        opponent.style.top = oData.top;
        rugbyField.appendChild(opponent);
        opponents.push(opponent);
        if(!isExporting) makeDraggable(opponent);
    });

    // Recréation du ballon
    if (firstFrame.ball) {
        ball = document.createElement('div');
        ball.id = firstFrame.ball.id;
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
        rugbyPosts.id = firstFrame.rugbyPosts.id;
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
        cone.id = cData.id;
        cone.classList.add('training-cone');
        cone.textContent = cData.id.replace('cone-', 'C'); // Ex: "C1", "C2"
        cone.style.left = cData.left;
        cone.style.top = cData.top;
        rugbyField.appendChild(cone);
        cones.push(cone);
        if(!isExporting) makeDraggable(cone);
    });

    // Recréation des piquets
    firstFrame.poles.forEach(pData => {
        const pole = document.createElement('div');
        pole.id = pData.id;
        pole.classList.add('training-pole');
        pole.textContent = pData.id.replace('pole-', 'P'); // Ex: "P1", "P2"
        pole.style.left = pData.left;
        pole.style.top = pData.top;
        rugbyField.appendChild(pole);
        poles.push(pole);
        if(!isExporting) makeDraggable(pole);
    });

    // Recréation des boucliers
    firstFrame.shields.forEach(sData => {
        const shield = document.createElement('div');
        shield.id = sData.id;
        shield.classList.add('training-shield');
        shield.textContent = sData.id.replace('shield-', 'S'); // Ex: "S1", "S2"
        shield.style.left = sData.left;
        shield.style.top = sData.top;
        rugbyField.appendChild(shield);
        shields.push(shield);
        if(!isExporting) makeDraggable(shield);
    });

    // Recréation des boudins
    firstFrame.boudins.forEach(bData => {
        const boudin = document.createElement('div');
        boudin.id = bData.id;
        boudin.classList.add('training-boudin');
        boudin.textContent = bData.id.replace('boudin-', 'B'); // Ex: "B1", "B2"
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

    // IMPORTANT : Assurez-vous que les bibliothèques html2canvas et gif.js sont chargées dans votre HTML
    // et que gif.worker.js est au bon endroit.
    if (typeof GIF === 'undefined' || typeof html2canvas === 'undefined') {
        alert("Les bibliothèques d'export (html2canvas ou gif.js) ne sont pas chargées. Vérifiez votre index.html et le chemin de vos scripts.");
        exportGifBtn.disabled = false;
        exportGifBtn.textContent = 'Exporter GIF';
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js', // Assurez-vous que le chemin est correct ici
        width: rugbyField.offsetWidth,
        height: rugbyField.offsetHeight,
        transparent: '#79c753' // Utilisez la couleur de fond de votre terrain pour la transparence si désiré (à adapter si votre couleur de terrain change)
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

    // Utilisation d'une boucle for...of pour s'assurer que les promesses sont résolues séquentiellement
    for (let i = 0; i < animationFrames.length; i++) {
        // Appliquer la frame
        applyFrame(animationFrames[i]);

        // Délai pour que le rendu se fasse AVANT la capture
        // Ce setTimeout est critique pour laisser le navigateur rendre les éléments à leurs nouvelles positions
        await new Promise(resolve => setTimeout(resolve, 50)); // Petit délai pour le rendu

        // Capturer le canvas après que la frame soit appliquée et rendue
        try {
            const canvas = await html2canvas(rugbyField, {
                scale: 1, // Capture à la taille réelle
                useCORS: true // Nécessaire si vous avez des images d'autres origines
            });
            gif.addFrame(canvas.getContext('2d'), { delay: animationSpeed }); // Ajoute la frame avec le délai
            console.log(`Frame <span class="math-inline">\{i \+ 1\}/</span>{animationFrames.length} capturée pour GIF.`);
        } catch (err) {
            console.error(`Erreur de capture de frame ${i} pour GIF:`, err);
            alert(`Erreur lors de la capture de la frame ${i}. Vérifiez la console.`);
            exportGifBtn.disabled = false;
            exportGifBtn.textContent = 'Exporter GIF';
            return; // Arrêter l'exportation en cas d'erreur
        }
    }

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

// --- Écouteurs globaux pour la désélection et la suppression au clavier ---

// Désélectionne un élément si on clique n'importe où sur le document, SAUF sur un élément draggable sélectionné,
// le bouton de suppression ou un autre bouton.
document.addEventListener('click', (e) => {
    // Si un élément est sélectionné ET que le clic n'est PAS sur cet élément sélectionné,
    // ni sur le bouton de suppression, ni sur un des boutons de contrôle.
    const isClickOnControl = e.target.closest('.controls-container') !== null;
    const isClickOnSelectedElement = selectedDraggableElement && selectedDraggableElement.contains(e.target);

    if (selectedDraggableElement && !isClickOnSelectedElement && !isClickOnControl) {
        deselectAllElements();
    }
});

// Écouteur d'événements pour la suppression par clavier (Delete/Backspace)
document.addEventListener('keydown', (e) => {
    // Vérifie si un élément est sélectionné ET que la touche est "Delete" ou "Backspace"
    if (selectedDraggableElement && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault(); // Empêche le comportement par défaut (ex: retour arrière dans certains navigateurs)
        deleteSelectedElement();
    }
});