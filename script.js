
const letterBag = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2,
  I: 9, J: 1, K: 1, L: 4, M: 2, N: 6, O: 8, P: 2,
  Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1,
  Y: 2, Z: 1
};

const letterScores = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4,
  I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3,
  Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10
};

let deck = [];
let hand = [];
let score = 0;

function shuffleDeck() {
  deck = [];
  // Create full deck first
  let fullDeck = [];
  for (let letter in letterBag) {
    for (let i = 0; i < letterBag[letter]; i++) {
      fullDeck.push(letter);
    }
  }
  // Take 40 random tiles from the full deck
  while (deck.length < 40 && fullDeck.length > 0) {
    const randomIndex = Math.floor(Math.random() * fullDeck.length);
    deck.push(fullDeck.splice(randomIndex, 1)[0]);
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function drawTiles(n = 7) {
  while (hand.length < n && deck.length > 0) {
    hand.push(deck.pop());
  }
  renderHand();
  updateMessage(deck.length + " tiles remaining in deck");
}

function updateTilesRemaining() {
  document.getElementById('tiles-remaining').textContent = `Tiles in bag: ${deck.length}`;
}

function renderHand() {
  const handDiv = document.getElementById('hand');
  handDiv.innerHTML = '';
  updateTilesRemaining();
  hand.forEach((letter, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.dataset.index = index;
    tile.onclick = () => tile.classList.toggle('selected');
    handDiv.appendChild(tile);
  });
}

function calculateWordScore(word) {
  return word.split('').reduce((sum, letter) => sum + letterScores[letter], 0);
}

function canMakeWord(word) {
  const availableLetters = [...hand];
  for (let letter of word) {
    const index = availableLetters.indexOf(letter);
    if (index === -1) return false;
    availableLetters.splice(index, 1);
  }
  return true;
}

function removeUsedLetters(word) {
  const lettersToRemove = word.split('');
  for (let letter of lettersToRemove) {
    const index = hand.indexOf(letter);
    if (index !== -1) hand.splice(index, 1);
  }
}

function discardSelected() {
  const selectedTiles = document.querySelectorAll('.tile.selected');
  selectedTiles.forEach(tile => {
    hand.splice(tile.dataset.index, 1);
  });
  drawTiles();
}

function updateMessage(text) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  setTimeout(() => messageDiv.textContent = '', 3000);
}

async function checkWordValidity(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function submitWord() {
  const input = document.getElementById('wordInput');
  const word = input.value.toUpperCase();
  
  if (word.length < 2) {
    updateMessage("Word must be at least 2 letters long");
    return;
  }

  if (!canMakeWord(word)) {
    updateMessage("Can't make this word with your current tiles");
    return;
  }

  const isValid = await checkWordValidity(word);
  if (!isValid) {
    updateMessage("Not a valid word!");
    return;
  }

  const wordScore = calculateWordScore(word);
  score += wordScore;
  document.getElementById('score').textContent = `Score: ${score}`;
  removeUsedLetters(word);
  drawTiles();
  input.value = '';
  updateMessage(`+${wordScore} points!`);

  document.getElementById('wordInput').focus();
}

// Initialize game
document.getElementById('submitWord').onclick = submitWord;
document.getElementById('drawTiles').onclick = () => drawTiles();
document.getElementById('discardTiles').onclick = discardSelected;
document.getElementById('wordInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitWord();
});

// Start game
shuffleDeck();
drawTiles();
document.getElementById('wordInput').focus();
