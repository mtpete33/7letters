const letterBag = {
  A: 6, B: 1, C: 1, D: 2, E: 7, F: 1, G: 1, H: 1,
  I: 6, J: 1, K: 1, L: 2, M: 1, N: 3, O: 6, P: 1,
  Q: 1, R: 3, S: 2, T: 3, U: 3, V: 1, W: 1, X: 1,
  Y: 1, Z: 1
};

const letterScores = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4,
  I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3,
  Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10
};

let remainingLetters = [];
let hand = [];
let score = 0;

function shuffleDeck() {
  remainingLetters = [];
  // Create fixed deck with exactly 40 tiles
  for (let letter in letterBag) {
    const count = Math.min(letterBag[letter], 2); // Take max 2 of each letter to keep it balanced
    for (let i = 0; i < count; i++) {
      remainingLetters.push(letter);
    }
  }
  // Sort alphabetically to ensure consistent order
  remainingLetters.sort();
}

function drawTiles(n = 7) {
  const availableSpaces = n - hand.length;
  const tilesToDraw = Math.min(availableSpaces, remainingLetters.length);
  
  for (let i = 0; i < tilesToDraw; i++) {
    const randomIndex = Math.floor(Math.random() * remainingLetters.length);
    hand.push(remainingLetters.splice(randomIndex, 1)[0]);
  }
  
  // Remove any undefined or empty tiles
  hand = hand.filter(tile => tile);
  
  renderHand();
  checkGameCompletion();
}

function saveGameScore(endType) {
  const previousScores = JSON.parse(localStorage.getItem('wordSolitaireScores') || '[]');
  const gameResult = {
    score,
    tilesLeft: hand.length + remainingLetters.length,
    date: new Date().toLocaleDateString(),
    endType
  };
  previousScores.unshift(gameResult);
  localStorage.setItem('wordSolitaireScores', JSON.stringify(previousScores.slice(0, 5)));
  displayPreviousScores();
}

function displayPreviousScores() {
  const scores = JSON.parse(localStorage.getItem('wordSolitaireScores') || '[]');
  const scoresList = document.getElementById('scores-list');
  scoresList.innerHTML = scores.map(game => {
    const endMessage = game.endType === 'solitaire' ? 'Solitaire!' : `${game.tilesLeft} tiles left`;
    return `<li>Score: ${game.score} (${endMessage}) - ${game.date}</li>`;
  }).join('');
}

function endGame(giveUp = false) {
  const endType = remainingLetters.length === 0 && hand.length === 0 ? 'solitaire' : 'incomplete';
  const message = giveUp ? 
    `Game Over! Final score: ${score} with ${hand.length + remainingLetters.length} tiles remaining` :
    `Congratulations! You've completed the game with a score of ${score}!`;
  
  updateMessage(message);
  document.getElementById('message').style.color = endType === 'solitaire' ? '#008000' : '#000000';
  document.getElementById('message').style.fontWeight = 'bold';
  document.getElementById('message').style.fontSize = '1.2em';
  
  // Show Play Again button and disable other game controls
  document.getElementById('playAgain').style.display = 'inline-block';
  document.getElementById('drawTiles').disabled = true;
  document.getElementById('newHand').disabled = true;
  document.getElementById('giveUp').disabled = true;
  document.getElementById('submitWord').disabled = true;
  document.getElementById('wordInput').disabled = true;
  
  saveGameScore(endType);
}

function resetGame() {
  // Reset game state
  score = 0;
  hand = [];
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('message').textContent = '';
  document.getElementById('wordInput').value = '';
  
  // Re-enable controls
  document.getElementById('playAgain').style.display = 'none';
  document.getElementById('drawTiles').disabled = false;
  document.getElementById('newHand').disabled = false;
  document.getElementById('giveUp').disabled = false;
  document.getElementById('submitWord').disabled = false;
  document.getElementById('wordInput').disabled = false;
  
  // Start new game
  shuffleDeck();
  drawTiles();
  document.getElementById('wordInput').focus();
}

function checkGameCompletion() {
  if (remainingLetters.length === 0 && hand.length === 0) {
    endGame(false);
  }
}

function updateTilesRemaining() {
  document.getElementById('tiles-remaining').textContent = `Tiles in bag: ${remainingLetters.length}`;
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

function getNewHand() {
  // Return current hand to the bag
  remainingLetters.push(...hand);
  hand = [];
  // Draw new hand of 7 tiles
  drawTiles(7);
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
    console.log(`Error checking word "${word}":`, error);
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
  checkGameCompletion();

  document.getElementById('wordInput').focus();
}

// Initialize game
document.getElementById('submitWord').onclick = submitWord;
document.getElementById('drawTiles').onclick = () => drawTiles();
document.getElementById('newHand').onclick = getNewHand;
document.getElementById('giveUp').onclick = () => endGame(true);
document.getElementById('playAgain').onclick = resetGame;
document.getElementById('wordInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitWord();
});

// Start game
shuffleDeck();
drawTiles();
document.getElementById('wordInput').focus();
displayPreviousScores();