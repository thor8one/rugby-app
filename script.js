const rugbyField = document.getElementById('rugby-field');
const addPlayerBtn = document.getElementById('addPlayer');
const addOpponentBtn = document.getElementById('addOpponent');
const addBallBtn = document.getElementById('addBall');
const addConeBtn = document.getElementById('addCone');
const addPoleBtn = document.getElementById('addPole');
const addShieldBtn = document.getElementById('addShield');
const addBoudinBtn = document.getElementById('addBoudin');
const clearFieldBtn = document.getElementById('clearField');
const captureFrameBtn = document.getElementById('captureFrame');
const startAnimationBtn = document.getElementById('startAnimation');
const stopAnimationBtn = document.getElementById('stopAnimation');
const exportGifBtn = document.getElementById('exportGif');

let draggedElement = null;
let selectedDraggableElement = null;
let currentDeleteButton = null;

// Les positions de décalage seront maintenant stockées en POURCENTAGES
let offsetX_percent; 
let offsetY_percent;

let players = [];
let opponents = [];
let ball = null; // Un seul ballon
let cones = [];
let poles = [];
let shields = [];
let boudins = [];

let playerCounter = 1;
let opponentCounter = 1;
let coneCounter = 1;
let poleCounter = 1;
let shieldCounter = 1;
let boudinCounter = 1;

let animationFrames = [];
let animationInterval;
let currentFrame = 0;

// --- Fonctions utilitaires pour convertir pixels en pourcentages et vice-versa ---
function pixelsToPercentage(pixels, parentDimension) {
    return (pixels / parentDimension) * 100;
}

function percentageToPixels(percentage, parentDimension) {
    return (percentage / 100) * parentDimension;
}

// --- Fonctions de sélection/désélection ---
function deselectAllElements() {
    if (selectedDraggableElement) {
        selectedDraggableElement.classList.remove('selected');
    }
    if (currentDeleteButton) {
        currentDeleteButton.remove();
        currentDeleteButton = null;
    }
    selectedDraggableElement = null;
}

function selectDraggableElement(elementToSelect) {
    // Désélectionne l'élément précédent si différent du nouvel élément sélectionné
    if (selectedDraggableElement && selectedDraggableElement !== elementToSelect) {
        selectedDraggableElement.classList.remove('selected');
        if (currentDeleteButton) {
            currentDeleteButton.remove();
            currentDeleteButton = null;
        }
    }

    if (elementToSelect) {
        // Si l'élément est déjà sélectionné, le désélectionner (clic sur un élément déjà sélectionné)
        if (selectedDraggableElement === elementToSelect) {
            elementToSelect.classList.remove('selected');
            if (currentDeleteButton) {
                currentDeleteButton.remove();
            }
            selectedDraggableElement = null;
            currentDeleteButton = null;
            return; // Sortir après désélection
        }

        selectedDraggableElement = elementToSelect;
        selectedDraggableElement.classList.add('selected');

        // Création et ajout du bouton de suppression
        currentDeleteButton = document.createElement('div');
        currentDeleteButton.classList.add('delete-button');
        currentDeleteButton.innerHTML = '&times;'; // Symbole "X"

        // Positionne le bouton par rapport à l'élément sélectionné.
        // Ces styles sont absolus par rapport à l'élément parent (l'élément déplaçable)
        currentDeleteButton.style.position = 'absolute';
        currentDeleteButton.style.right = '-10px';
        currentDeleteButton.style.top = '-10px';
        currentDeleteButton.style.zIndex = '101';

        selectedDraggableElement.appendChild(currentDeleteButton);

        // Écouteur d'événement pour le bouton de suppression
        currentDeleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche le clic de se propager à l'élément parent (draggable)
            deleteSelectedElement();
        });
    } else {
        // Si elementToSelect est null, cela signifie qu'on veut juste désélectionner tout
        deselectAllElements();
    }
}

// --- Fonction de suppression ---
function deleteSelectedElement() {
    if (selectedDraggableElement) {
        selectedDraggableElement.remove();

        const elementId = selectedDraggableElement.id;
        if (elementId.startsWith('player')) {
            players = players.filter(p => p.id !== elementId);
        } else if (elementId.startsWith('opponent')) {
            opponents = opponents.filter(o => o.id !== elementId);
        } else if (elementId === 'ball') {
            ball = null;
        } else if (elementId.startsWith('cone')) {
            cones = cones.filter(c => c.id !== elementId);
        } else if (elementId.startsWith('pole')) {
            poles = poles.filter(p => p.id !== elementId);
        } else if (elementId.startsWith('shield')) {
            shields = shields.filter(s => s.id !== elementId);
        } else if (elementId.startsWith('boudin')) {
            boudins = boudins.filter(b => b.id !== elementId);
        }

        deselectAllElements();
    }
}

// --- Fonctions d'ajout d'éléments ---
function addDraggableElement(type, text = '', initialLeft = 50, initialTop = 50) {
    const element = document.createElement('div');
    element.classList.add(type);

    // Attribution d'un ID unique
    let id;
    if (type === 'player') { id = `player-${playerCounter++}`; players.push(element); }
    else if (type === 'opponent') { id = `opponent-${opponentCounter++}`; opponents.push(element); }
    else if (type === 'ball') { id = 'ball'; ball = element; }
    else if (type === 'training-cone') { id = `cone-${coneCounter++}`; cones.push(element); }
    else if (type === 'training-pole') { id = `pole-${poleCounter++}`; poles.push(element); }
    else if (type === 'training-shield') { id = `shield-${shieldCounter++}`; shields.push(element); }
    else if (type === 'training-boudin') { id = `boudin-${boudinCounter++}`; boudins.push(element); }

    element.id = id;
    element.textContent = text;

    // Positionnement initial en POURCENTAGES (basé sur la taille fixe si connue, ou centré)
    // Ici, initialLeft et initialTop sont déjà supposés être en pourcentages si on les passe ainsi
    // Sinon, on centre l'élément ajouté au départ.
    const fieldRect = rugbyField.getBoundingClientRect();
    const elementWidth = element.offsetWidth || 40; // Estimer la taille si pas encore rendue
    const elementHeight = element.offsetHeight || 40; // Estimer la taille si pas encore rendue

    // Calculer la position initiale pour centrer le nouvel élément
    const initialLeftPx = (fieldRect.width / 2) - (elementWidth / 2);
    const initialTopPx = (fieldRect.height / 2) - (elementHeight / 2);

    element.style.left = `${pixelsToPercentage(initialLeftPx, fieldRect.width)}%`;
    element.style.top = `${pixelsToPercentage(initialTopPx, fieldRect.height)}%`;

    rugbyField.appendChild(element);
    makeDraggable(element); // Rend l'élément déplaçable
}

// --- Logique de glisser-déposer ---
function makeDraggable(element) {
    // Gestion des événements de SOURIS
    element.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('delete-button')) {
            return; // N'active pas le glisser-déposer si le clic est sur la croix
        }
        
        e.stopPropagation(); 
        selectDraggableElement(element);

        draggedElement = element;
        const fieldRect = rugbyField.getBoundingClientRect();
        const elementRect = draggedElement.getBoundingClientRect();
        
        // Calculer offsetX et offsetY en POURCENTAGES
        offsetX_percent = pixelsToPercentage(e.clientX - elementRect.left, fieldRect.width);
        offsetY_percent = pixelsToPercentage(e.clientY - elementRect.top, fieldRect.height);

        draggedElement.style.cursor = 'grabbing';
    });

    // Gestion des événements TACTILES
    element.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('delete-button')) {
            return;
        }
        e.stopPropagation(); 
        e.preventDefault(); // Empêche le défilement/zoom par défaut
        
        selectDraggableElement(element);

        draggedElement = element;
        let touch = e.touches[0];
        const fieldRect = rugbyField.getBoundingClientRect();
        const elementRect = draggedElement.getBoundingClientRect();
        
        // Calculer offsetX et offsetY en POURCENTAGES
        offsetX_percent = pixelsToPercentage(touch.clientX - elementRect.left, fieldRect.width);
        offsetY_percent = pixelsToPercentage(touch.clientY - elementRect.top, fieldRect.height);
    });
}

// --- Événements globaux pour le glisser-déposer ---
document.addEventListener('mousemove', (e) => {
    if (!draggedElement) return;

    const fieldRect = rugbyField.getBoundingClientRect();
    let newLeftPx = e.clientX - fieldRect.left - percentageToPixels(offsetX_percent, fieldRect.width);
    let newTopPx = e.clientY - fieldRect.top - percentageToPixels(offsetY_percent, fieldRect.height);

    // Obtenir les dimensions réelles de l'élément en pixels
    const elementWidthPx = draggedElement.offsetWidth;
    const elementHeightPx = draggedElement.offsetHeight;

    // Limiter le déplacement à l'intérieur du terrain
    newLeftPx = Math.max(0, Math.min(newLeftPx, fieldRect.width - elementWidthPx));
    newTopPx = Math.max(0, Math.min(newTopPx, fieldRect.height - elementHeightPx));

    // Appliquer les nouvelles positions en POURCENTAGES
    draggedElement.style.left = `${pixelsToPercentage(newLeftPx, fieldRect.width)}%`;
    draggedElement.style.top = `${pixelsToPercentage(newTopPx, fieldRect.height)}%`;
});

document.addEventListener('mouseup', () => {
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement = null;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!draggedElement || e.touches.length === 0) return;

    let touch = e.touches[0];
    const fieldRect = rugbyField.getBoundingClientRect();
    let newLeftPx = touch.clientX - fieldRect.left - percentageToPixels(offsetX_percent, fieldRect.width);
    let newTopPx = touch.clientY - fieldRect.top - percentageToPixels(offsetY_percent, fieldRect.height);

    const elementWidthPx = draggedElement.offsetWidth;
    const elementHeightPx = draggedElement.offsetHeight;

    newLeftPx = Math.max(0, Math.min(newLeftPx, fieldRect.width - elementWidthPx));
    newTopPx = Math.max(0, Math.min(newTopPx, fieldRect.height - elementHeightPx));

    draggedElement.style.left = `${pixelsToPercentage(newLeftPx, fieldRect.width)}%`;
    draggedElement.style.top = `${pixelsToPercentage(newTopPx, fieldRect.height)}%`;
});

document.addEventListener('touchend', () => {
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
        draggedElement = null;
    }
});

// --- Écouteur global pour la désélection en cliquant hors d'un élément sélectionné ou des contrôles ---
document.addEventListener('click', (e) => {
    const isClickOnControl = e.target.closest('.controls-container') !== null;
    const isClickOnSelectedElement = selectedDraggableElement && selectedDraggableElement.contains(e.target);
    const isClickOnDeleteButton = e.target.classList.contains('delete-button');

    // Ne désélectionne PAS si le clic est sur l'élément sélectionné ou sur un bouton de contrôle ou sur le bouton de suppression.
    if (selectedDraggableElement && !isClickOnSelectedElement && !isClickOnControl && !isClickOnDeleteButton) {
        deselectAllElements();
    }
});

// --- Écouteurs pour les touches du clavier (Suppr/Backspace) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDraggableElement) {
            deleteSelectedElement();
            e.preventDefault(); // Empêche l'action par défaut (ex: retour en arrière dans le navigateur)
        }
    }
});

// --- Fonctions d'animation ---
function saveCurrentFrame() {
    const frame = [];
    // Sauvegarder les positions en POURCENTAGES
    document.querySelectorAll('#rugby-field > div:not(.delete-button)').forEach(element => {
        frame.push({
            id: element.id,
            type: Array.from(element.classList).filter(c => c !== 'selected' && c !== 'draggable').join(' '), // Garde le type principal
            left: element.style.left,
            top: element.style.top,
            textContent: element.textContent // Pour les numéros de joueur, etc.
        });
    });
    animationFrames.push(frame);
    console.log(`Frame ${animationFrames.length} capturée.`);
}

function applyFrame(frame) {
    // D'abord, effacer tous les éléments existants sur le terrain
    rugbyField.innerHTML = '';
    deselectAllElements(); // Assurez-vous qu'aucun élément n'est sélectionné

    // Ensuite, recréer et positionner les éléments de la frame
    frame.forEach(elementData => {
        let element = document.createElement('div');
        element.classList.add(elementData.type);
        element.id = elementData.id;
        element.textContent = elementData.textContent;
        element.style.left = elementData.left; // Les positions sont déjà en %
        element.style.top = elementData.top;   // Les positions sont déjà en %
        rugbyField.appendChild(element);
        makeDraggable(element); // Rendre les éléments de la frame déplaçables
    });
}

function startAnimation() {
    if (animationFrames.length === 0) {
        alert("Veuillez capturer au moins une frame avant de démarrer l'animation.");
        return;
    }
    stopAnimation(); // Arrête toute animation précédente
    currentFrame = 0;
    animationInterval = setInterval(() => {
        applyFrame(animationFrames[currentFrame]);
        currentFrame = (currentFrame + 1) % animationFrames.length; // Boucle l'animation
    }, 500); // Intervalle de 500ms (ajustable)
    console.log("Animation démarrée.");
}

function stopAnimation() {
    clearInterval(animationInterval);
    console.log("Animation arrêtée.");
}

/*function exportGif() {
    if (animationFrames.length === 0) {
        alert("Capturez des frames avant d'exporter le GIF.");
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js', // Assurez-vous que ce chemin est correct
        width: rugbyField.offsetWidth, // Utilisez la largeur actuelle du terrain
        height: rugbyField.offsetHeight, // Utilisez la hauteur actuelle du terrain
        transparent: '#000000' // Fond transparent, ajustez si votre terrain a une couleur spécifique
    });

    // Fonction pour capturer et ajouter une frame au GIF
    const addFrameToGif = (frameIndex) => {
        if (frameIndex >= animationFrames.length) {
            gif.render(); // Toutes les frames ont été ajoutées, lance le rendu
            return;
        }

        applyFrame(animationFrames[frameIndex]); // Applique la frame pour la rendre visible

        // Capture du canvas du terrain de rugby
        html2canvas(rugbyField, {
            backgroundColor: null, // Transparent
            useCORS: true,
            allowTaint: true,
        }).then(canvas => {
            gif.addFrame(canvas.getContext('2d'), { delay: 500 }); // Ajoutez la frame avec un délai
            addFrameToGif(frameIndex + 1); // Passe à la frame suivante
        }).catch(error => {
            console.error("Erreur lors de la capture de la frame pour le GIF:", error);
            alert("Erreur lors de la capture d'une frame pour le GIF. Vérifiez la console.");
        });
    };

    gif.on('finished', (blob) => {
        window.open(URL.createObjectURL(blob));
        alert("GIF généré ! Il s'ouvre dans un nouvel onglet.");
    });

    gif.on('progress', (p) => {
        console.log(`Progression du GIF : ${Math.round(p * 100)}%`);
    });

    gif.on('error', (error) => {
        console.error("Erreur GIF.js:", error);
        alert("Une erreur est survenue lors de la génération du GIF. Vérifiez la console.");
    });

    alert("Génération du GIF en cours... Cela peut prendre un certain temps.");
    addFrameToGif(0); // Démarre le processus d'ajout de frames
}*/
/*function exportGif() {
    if (animationFrames.length === 0) {
        alert("Capturez des frames avant d'exporter le GIF.");
        return;
    }

    const gifWidth = rugbyField.offsetWidth; 
    const gifHeight = rugbyField.offsetHeight;

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js',
        width: gifWidth,
        height: gifHeight,
        transparent: '#000000'
    });

    const addFrameToGif = (frameIndex) => {
        if (frameIndex >= animationFrames.length) {
            gif.render();
            return;
        }

        applyFrame(animationFrames[frameIndex]);

        html2canvas(rugbyField, {
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
        }).then(canvas => {
            if (canvas.width > 0 && canvas.height > 0) {
                gif.addFrame(canvas.getContext('2d'), { delay: 500 });
            } else {
                console.warn("Canvas vide ou invalide pour la frame " + frameIndex + ". Largeur:", canvas.width, "Hauteur:", canvas.height);
            }
            addFrameToGif(frameIndex + 1);
        }).catch(error => {
            console.error("Erreur lors de la capture de la frame pour le GIF:", error);
            alert("Erreur lors de la capture d'une frame pour le GIF. Vérifiez la console.");
            gif.abort(); 
        });
    };

    // --- MODIFICATION ICI : REMPLACEZ CETTE SECTION ---
    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation_rugby.gif'; // Nom du fichier lors du téléchargement
        document.body.appendChild(a); // Ajoute le lien au DOM (nécessaire pour simuler un clic)
        a.click(); // Simule un clic sur le lien
        document.body.removeChild(a); // Supprime le lien du DOM après le clic
        URL.revokeObjectURL(url); // Libère la mémoire
        alert("GIF généré et téléchargement démarré !");
    });
    // --- FIN DE LA MODIFICATION ---

    gif.on('progress', (p) => {
        console.log(`Progression du GIF : ${Math.round(p * 100)}%`);
    });

    gif.on('error', (error) => {
        console.error("Erreur GIF.js:", error);
        alert("Une erreur est survenue lors de la génération du GIF. Vérifiez la console.");
    });

    alert("Génération du GIF en cours... Cela peut prendre un certain temps.");
    addFrameToGif(0);
}*/
/*async function exportGif() {
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
*/
function exportGif() {
    if (animationFrames.length === 0) {
        alert("Capturez des frames avant d'exporter le GIF.");
        return;
    }

    // --- DIMENSIONS CIBLES POUR LE GIF ---
    const targetGifWidth = 1000; // Largeur désirée du GIF
    const targetGifHeight = 600; // Hauteur désirée du GIF
    // --- FIN DIMENSIONS CIBLES ---

    // Sauvegarder les styles actuels du terrain pour les restaurer après la capture
    const originalFieldStyle = {
        width: rugbyField.style.width,
        height: rugbyField.style.height,
        maxWidth: rugbyField.style.maxWidth,
        aspectRatio: rugbyField.style.aspectRatio
    };

    // Temporairement, définir les dimensions fixes du terrain pour la capture
    // On désactive aussi le max-width et l'aspect-ratio pour que les dimensions fixes soient prioritaires
    rugbyField.style.width = `${targetGifWidth}px`;
    rugbyField.style.height = `${targetGifHeight}px`;
    rugbyField.style.maxWidth = 'none'; // Important pour ne pas limiter la largeur fixe
    rugbyField.style.aspectRatio = 'auto'; // Important pour ne pas forcer un ratio pendant la taille fixe

    // Assurez-vous que tous les éléments enfants aussi prennent leur taille en pixels
    // et leurs positions en pixels si nécessaire, sinon ils apparaîtront minuscules ou décalés.
    // Cette partie est cruciale car vos éléments sont en pourcentages.
    // Nous devons convertir leur position et taille en pixels temporairement.

    const elementsToRestore = [];
    document.querySelectorAll('#rugby-field > div:not(.delete-button)').forEach(element => {
        const currentLeftPercent = parseFloat(element.style.left);
        const currentTopPercent = parseFloat(element.style.top);
        const currentWidthPercent = parseFloat(element.style.width); // Récupérer la taille actuelle en %
        const currentHeightPercent = parseFloat(element.style.height); // Récupérer la taille actuelle en %

        // Sauvegarder les styles originaux en pourcentage
        elementsToRestore.push({
            element: element,
            originalLeft: element.style.left,
            originalTop: element.style.top,
            originalWidth: element.style.width,
            originalHeight: element.style.height,
            originalAspectRatio: element.style.aspectRatio,
            originalFontSize: element.style.fontSize
        });

        // Convertir les positions et tailles en pixels absolus pour la capture
        // La taille des éléments doit être proportionnelle aux 1000x600 du terrain
        element.style.left = `${(currentLeftPercent / 100) * targetGifWidth}px`;
        element.style.top = `${(currentTopPercent / 100) * targetGifHeight}px`;
        
        // Convertir les largeurs/hauteurs % en pixels pour les dimensions cibles du GIF
        element.style.width = `${(currentWidthPercent / 100) * targetGifWidth}px`;
        element.style.height = 'auto'; // La hauteur sera gérée par l'aspect-ratio CSS initial
        element.style.aspectRatio = element.dataset.originalAspectRatio || '1'; // S'assurer que le ratio est conservé si défini en CSS
        // Ajuster la taille de la police pour qu'elle soit lisible sur le GIF 1000x600
        // Par exemple, si 0.7em est bien pour 300px, 1.4em sera bien pour 600px, etc.
        const originalFontSizePx = parseFloat(window.getComputedStyle(element).fontSize);
        element.style.fontSize = `${(originalFontSizePx / rugbyField.offsetWidth) * targetGifWidth}px`;
        // OU, une valeur fixe si vous voulez que la police soit toujours de la même taille sur le GIF
        // element.style.fontSize = `1em`; // Ajustez cette valeur si besoin
    });

    // Initialiser GIF.js avec les dimensions cibles
    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js',
        width: targetGifWidth, // C'est la largeur que le GIF aura
        height: targetGifHeight, // C'est la hauteur que le GIF aura
        transparent: '#000000'
    });

    const addFrameToGif = (frameIndex) => {
        if (frameIndex >= animationFrames.length) {
            gif.render();
            return;
        }

        applyFrame(animationFrames[frameIndex]); // Applique la frame. Les éléments sont déjà en pixels pour la capture.

        html2canvas(rugbyField, {
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
            // Capture à la taille définie temporairement par le JS
            width: targetGifWidth,
            height: targetGifHeight,
            scale: 1 // Capture à l'échelle 1:1 de la taille définie
        }).then(canvas => {
            if (canvas.width > 0 && canvas.height > 0) {
                gif.addFrame(canvas.getContext('2d'), { delay: 500 });
                console.log(`Frame ${frameIndex} ajoutée au GIF (taille: ${canvas.width}x${canvas.height}).`);
            } else {
                console.warn(`Canvas vide ou invalide pour la frame ${frameIndex}. Largeur: ${canvas.width}, Hauteur: ${canvas.height}`);
            }
            addFrameToGif(frameIndex + 1);
        }).catch(error => {
            console.error("Erreur lors de la capture de la frame pour le GIF:", error);
            alert("Erreur lors de la capture d'une frame pour le GIF. Vérifiez la console.");
            gif.abort();
            // Assurez-vous de restaurer les styles en cas d'erreur aussi
            restoreOriginalStyles();
        });
    };

    // Fonction pour restaurer les styles d'origine
    const restoreOriginalStyles = () => {
        // Restaurer les styles du terrain
        rugbyField.style.width = originalFieldStyle.width;
        rugbyField.style.height = originalFieldStyle.height;
        rugbyField.style.maxWidth = originalFieldStyle.maxWidth;
        rugbyField.style.aspectRatio = originalFieldStyle.aspectRatio;

        // Restaurer les styles de chaque élément
        elementsToRestore.forEach(data => {
            data.element.style.left = data.originalLeft;
            data.element.style.top = data.originalTop;
            data.element.style.width = data.originalWidth;
            data.element.style.height = data.originalHeight;
            data.element.style.aspectRatio = data.originalAspectRatio;
            data.element.style.fontSize = data.originalFontSize;
        });
    };

    gif.on('finished', (blob) => {
        restoreOriginalStyles(); // Restaurer les styles une fois le GIF généré
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation_rugby.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("GIF généré et téléchargement démarré !");
    });

    gif.on('progress', (p) => {
        console.log(`Progression du GIF : ${Math.round(p * 100)}%`);
    });

    gif.on('error', (error) => {
        console.error("Erreur GIF.js:", error);
        alert("Une erreur est survenue lors de la génération du GIF. Vérifiez la console.");
        restoreOriginalStyles(); // Restaurer les styles en cas d'erreur
    });

    alert("Génération du GIF en cours... Cela peut prendre un certain temps.");
    addFrameToGif(0);
}
// --- Fonction pour effacer tous les éléments du terrain ---
function clearField() {
    rugbyField.innerHTML = '';
    players = [];
    opponents = [];
    ball = null;
    cones = [];
    poles = [];
    shields = [];
    boudins = [];

    playerCounter = 1;
    opponentCounter = 1;
    coneCounter = 1;
    poleCounter = 1;
    shieldCounter = 1;
    boudinCounter = 1;

    animationFrames = [];
    stopAnimation();
    deselectAllElements();
    console.log("Terrain effacé et frames d'animation réinitialisées.");
}

// --- Événements des boutons ---
addPlayerBtn.addEventListener('click', () => addDraggableElement('player', `P${playerCounter}`));
addOpponentBtn.addEventListener('click', () => addDraggableElement('opponent', `O${opponentCounter}`));
addBallBtn.addEventListener('click', () => { if (!ball) addDraggableElement('ball', 'B'); });
addConeBtn.addEventListener('click', () => addDraggableElement('training-cone', `C${coneCounter}`));
addPoleBtn.addEventListener('click', () => addDraggableElement('training-pole', `Pi${poleCounter}`));
addShieldBtn.addEventListener('click', () => addDraggableElement('training-shield', `Bouclier${shieldCounter}`));
addBoudinBtn.addEventListener('click', () => addDraggableElement('training-boudin', `Boudin${boudinCounter}`));

clearFieldBtn.addEventListener('click', clearField);
captureFrameBtn.addEventListener('click', saveCurrentFrame);
startAnimationBtn.addEventListener('click', startAnimation);
stopAnimationBtn.addEventListener('click', stopAnimation);
exportGifBtn.addEventListener('click', exportGif);

// Appliquer les tailles relatives lors du redimensionnement de la fenêtre
// Ceci est crucial pour que le terrain de rugby recalcule sa taille et que les éléments suivent
window.addEventListener('resize', () => {
    // Si des éléments sont déjà sur le terrain, leurs positions et tailles en pixels
    // seront recalibrées par le navigateur grâce aux % et aspect-ratio CSS.
    // Pas besoin de refaire de calculs JS ici, juste s'assurer que le navigateur ré-applique les styles.
});