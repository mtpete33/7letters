const letterBag = {
  A: 4, B: 1, C: 1, D: 2, E: 4, F: 1, G: 1, H: 1,
  I: 4, J: 1, K: 1, L: 2, M: 1, N: 3, O: 4, P: 1,
  Q: 1, R: 3, S: 2, T: 3, U: 4, V: 1, W: 1, X: 1,
  Y: 1, Z: 1
};

let remainingLetters = [];
let hand = [];
let totalTiles = 0;
let usedTiles = 0;
let score = 0;

function shuffleDeck() {
  // Calculate total tiles
  totalTiles = Object.values(letterBag).reduce((sum, count) => sum + count, 0);
  usedTiles = 0;
  remainingLetters = [];
  // Create deck using all tiles from letterBag
  for (let letter in letterBag) {
    const count = letterBag[letter];
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
  const progressPercent = Math.round((usedTiles / totalTiles) * 100);
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
    return `<li>${game.score} points (${endMessage}) - ${game.date}</li>`;
  }).join('');
}

function endGame(giveUp = false) {
  const endType = remainingLetters.length === 0 && hand.length === 0 ? 'solitaire' : 'incomplete';
  const progressPercent = Math.round((usedTiles / totalTiles) * 100);

  // Add bonus points for using all tiles
  if (!giveUp && endType === 'solitaire') {
    score += 15;
    updateProgress();
  }

  const message = giveUp ? 
    `Game Over! You used ${progressPercent}% of available tiles` :
    `Congratulations! You've completed the game using ${progressPercent}% of tiles!${endType === 'solitaire' ? ' (+15 bonus points!)' : ''}`;

  updateMessage(message);
  document.getElementById('message').style.color = endType === 'solitaire' ? '#008000' : '#000000';
  document.getElementById('message').style.fontWeight = 'bold';
  document.getElementById('message').style.fontSize = '1.2em';

  // Show Play Again button and hide/disable other game controls
  document.getElementById('playAgain').style.display = 'inline-block';
  document.getElementById('newHand').style.display = 'none';
  document.getElementById('giveUp').style.display = 'none';
  document.getElementById('submitWord').style.display = 'none';
  document.getElementById('submitWord').disabled = true;
  document.getElementById('wordInput').disabled = true;

  if (giveUp || endType === 'solitaire') {
    saveGameScore(endType);
  }
}

function resetGame() {
  // Reset game state
  score = 0;
  hand = [];
  usedTiles = 0;
  document.getElementById('words-list').innerHTML = '';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('message').textContent = '';
  document.getElementById('wordInput').value = '';
  document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';

  // Re-enable and show all controls
  document.getElementById('playAgain').style.display = 'none';
  document.getElementById('newHand').style.display = 'inline-block';
  document.getElementById('giveUp').style.display = 'inline-block';
  document.getElementById('submitWord').style.display = 'inline-block';
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
    tile.onclick = () => {
        const input = document.getElementById('wordInput');
        const currentWord = input.value;
        const letterCount = hand.filter(l => l === letter).length;
        const letterUsedCount = currentWord.split('').filter(l => l === letter).length;

        if (letterUsedCount < letterCount) {
            input.value += letter;
            tile.classList.add('selected');
            setTimeout(() => tile.classList.remove('selected'), 200);
        } else {
            updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
        }
    };
    handDiv.appendChild(tile);
  });
}

function updateProgress() {
  const progressPercent = (usedTiles / totalTiles) * 100;
  document.getElementById('score').textContent = `Score: ${score} points`;
  document.getElementById('progress').innerHTML = `<div class="progress-bar"><div class="progress" style="width: ${progressPercent}%"></div></div> ${Math.round(progressPercent)}%`;
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
  // Subtract 1 point for new hand
  score -= 1;
  updateProgress();
  // Draw new hand of 7 tiles
  drawTiles(7);
}

function updateMessage(text) {
  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('fade-out');
  messageDiv.textContent = text;
  setTimeout(() => {
    messageDiv.classList.add('fade-out');
    setTimeout(() => messageDiv.textContent = '', 1000);
  }, 1000);
}

async function checkWordValidity(word) {
  // Words that should not be counted even if they're in the API
  const invalidWords = new Set(['HED', 'EDS', 'ENS', 'EMS', 'ELS', 'AES', 'ARS', 'UTS', 'TES', 'KI', 'YI', 'JAN', 'ZE', 'RI', 'UV', 'THOT', 'RAV', 'FY', 'SAV', 'ZOL', 'UNIX', 'UR', 'CRAN', 'QUEEF', 'CLIT', 'OU', 'JOOK', 'BRU', 'FUCK', 'AU', 'JIP']);

  if (invalidWords.has(word)) {
    return false;
  }

  // Common words that might not be in the API that should count
  const commonWords = new Set(['THE', 'AN', 'A', 'IN', 'ON', 'AT', 'TO', 'FOR', 'OF', 'WITH', 'BY', 'AND', 'OR', 'BUT', 'NOT', 'IS', 'IT', 'BE', 'YOU', 'TOW', 'NET', 'SPINED']);

  if (commonWords.has(word)) {
    return true;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return response.ok;
  } catch (error) {
    console.log(`Error checking word "${word}":`, error);
    return false;
  }
}

async function getWordDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    if (!response.ok) return "Definition not found";
    const data = await response.json();
    return data[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found";
  } catch (error) {
    console.error("Error fetching definition:", error);
    return "Definition not found";
  }
}

async function addWordToHistory(word, definition) {
  const wordsList = document.getElementById('words-list');
  const li = document.createElement('li');
  li.className = 'word-item';
  
  const tooltip = document.createElement('div');
  tooltip.className = 'word-tooltip';
  tooltip.textContent = definition;
  
  li.textContent = word;
  li.appendChild(tooltip);
  
  // Mobile touch handling
  li.addEventListener('click', function() {
    if (window.innerWidth <= 768) {
      const wasActive = this.classList.contains('show-tooltip');
      // Remove active class from all items
      document.querySelectorAll('.word-item').forEach(item => {
        item.classList.remove('show-tooltip');
      });
      if (!wasActive) {
        this.classList.add('show-tooltip');
      }
    }
  });
  
  // Insert at the beginning of the list
  if (wordsList.firstChild) {
    wordsList.insertBefore(li, wordsList.firstChild);
  } else {
    wordsList.appendChild(li);
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
    if (word === "QUONE") {
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = 'Loading...';
      const img = new Image();
      img.onload = () => {
        messageDiv.innerHTML = '';
        img.style.maxWidth = "300px";
        img.style.marginTop = "10px";
        messageDiv.appendChild(img);
      };
      img.onerror = () => {
        console.error("Failed to load QUONE image");
        messageDiv.textContent = "Not a valid word";
      };
      img.src = "images/quone.webp";
      img.alt = "QUONE";
    } else {
      updateMessage("Not a valid word");
    }
    input.value = '';
    input.focus();
    return;
  }

  usedTiles += word.length;
  // Calculate score based on word length
  if (word.length === 7) {
    score += 15;
  } else if (word.length === 6) {
    score += 8;
  } else if (word.length === 5) {
    score += 7;
  } else if (word.length === 4) {
    score += 5;
  } else if (word.length === 3) {
    score += 3;
  } else if (word.length === 2) {
    score += 2;
  }

  // Show success message with points earned
  const points = word.length === 7 ? 15 : 
                word.length === 6 ? 8 : 
                word.length === 5 ? 7 : 
                word.length === 4 ? 5 : 
                word.length === 3 ? 3 : 2;

  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('fade-out');
  messageDiv.style.color = '#4CAF50';
  messageDiv.innerHTML = `${word}<br>+${points}pts!`;
  setTimeout(() => {
    messageDiv.classList.add('fade-out');
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.style.color = '';
    }, 1000);
  }, 1000);

  console.log(`Word "${word}" used ${word.length} tiles`);
  console.log(`Total tiles used: ${usedTiles} out of ${totalTiles}`);
  updateProgress();
  removeUsedLetters(word);
  drawTiles();
  input.value = '';
  checkGameCompletion();
  
  // Add word to history with definition
  const definition = await getWordDefinition(word);
  addWordToHistory(word, definition);

  document.getElementById('wordInput').focus();
}


// Initialize game
document.getElementById('submitWord').onclick = submitWord;

document.getElementById('newHand').addEventListener('click', getNewHand);
document.getElementById('giveUp').onclick = () => {
  document.getElementById('confirmModal').style.display = 'block';
};

document.getElementById('confirmGiveUp').onclick = () => {
  document.getElementById('confirmModal').style.display = 'none';
  endGame(true);
};

document.getElementById('cancelGiveUp').onclick = () => {
  document.getElementById('confirmModal').style.display = 'none';
};
document.getElementById('playAgain').onclick = resetGame;
const wordInput = document.getElementById('wordInput');
wordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitWord();
});
// Only allow keyboard input on non-touch devices
if (!('ontouchstart' in window)) {
  wordInput.removeAttribute('readonly');

  wordInput.addEventListener('keydown', (e) => {
    if (e.key.length === 1) { // If it's a character key
      const letter = e.key.toUpperCase();
      const currentWord = wordInput.value;
      const letterCount = hand.filter(l => l === letter).length;
      const letterUsedCount = currentWord.split('').filter(l => l === letter).length;

      if (letterCount === 0) {
        e.preventDefault();
        updateMessage(`"${letter}" is not available in your hand`);
      } else if (letterUsedCount >= letterCount) {
        e.preventDefault();
        updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
      }
    }
  });

  wordInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });
}

// Clear input button
document.getElementById('clearInput').onclick = () => {
  document.getElementById('wordInput').value = '';
  document.getElementById('wordInput').focus();
};

// Start game
shuffleDeck();
drawTiles();
document.getElementById('wordInput').focus();
displayPreviousScores();
document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';