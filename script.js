// Regular game letter bag
const letterBag = {
  A: 5, B: 1, C: 1, D: 2, E: 4, F: 1, G: 1, H: 1,
  I: 4, J: 1, K: 1, L: 2, M: 1, N: 3, O: 4, P: 1,
  Q: 1, R: 3, S: 2, T: 3, U: 3, V: 1, W: 1, X: 1,
  Y: 1, Z: 1
};

// Uncomment for testing QUONE
// const letterBag = {
//   E: 2, O: 2, N: 2,
//   Q: 2, U: 2 
// };

// Test mode - uncomment this for quick endgame testing
// const letterBag = {
//   A: 1, T: 1 
// };

let remainingLetters = [];
let hand = [];
let totalTiles = 0;
let usedTiles = 0;
let score = 0;

function shuffleDeck() {
  totalTiles = Object.values(letterBag).reduce((sum, count) => sum + count, 0);
  usedTiles = 0;
  remainingLetters = [];
  for (let letter in letterBag) {
    const count = letterBag[letter];
    for (let i = 0; i < count; i++) {
      remainingLetters.push(letter);
    }
  }
  remainingLetters.sort();
}

function drawTiles(n = 7) {
  const availableSpaces = n - hand.length;
  const tilesToDraw = Math.min(availableSpaces, remainingLetters.length);
  const startIndex = hand.length;

  for (let i = 0; i < tilesToDraw; i++) {
    const randomIndex = Math.floor(Math.random() * remainingLetters.length);
    const tile = remainingLetters.splice(randomIndex, 1)[0];
    hand.push({ letter: tile, isNew: true });
  }
  hand = hand.filter(tile => tile);
  renderHand();
  checkGameCompletion();

  // Reset the isNew flag after rendering
  hand.forEach(tile => tile.isNew = false);
}

let hasGameBeenSaved = false;

function saveGameScore(endType) {
  if (hasGameBeenSaved) {
    console.log('Game already saved, skipping duplicate save');
    return;
  }
  
  console.log(`Saving score - called from: ${new Error().stack.split('\n')[2].trim()}`);
  console.log('Save details:', {
    score,
    endType,
    tilesLeft: hand.length + remainingLetters.length,
    usedTiles,
    totalTiles,
    progressPercent: Math.round((usedTiles / totalTiles) * 100),
    handLength: hand.length,
    remainingLettersLength: remainingLetters.length
  });
  
  const previousScores = JSON.parse(localStorage.getItem('wordSolitaireScores') || '[]');
  const progressPercent = Math.round((usedTiles / totalTiles) * 100);
  const gameResult = {
    score,
    tilesLeft: hand.length + remainingLetters.length,
    date: new Date().toLocaleDateString(),
    endType,
    progressPercent
  };
  previousScores.unshift(gameResult);
  localStorage.setItem('wordSolitaireScores', JSON.stringify(previousScores.slice(0, 10)));
  displayPreviousScores();
  hasGameBeenSaved = true;
  console.log('Game marked as saved');
}

function displayPreviousScores() {
  const scores = JSON.parse(localStorage.getItem('wordSolitaireScores') || '[]');
  const scoresList = document.getElementById('scores-list');
  scoresList.innerHTML = scores.map(game => {
    const endMessage = game.endType === 'solitaire' ? 'Win!' : `${game.tilesLeft} tiles left`;
    return `<li>${game.score} points (${endMessage}) - ${game.date}</li>`;
  }).join('');
}

function endGame() {
  saveGameScore('incomplete');
  
  const tilesLeft = hand.length + remainingLetters.length;
  const tileText = tilesLeft === 1 ? 'tile' : 'tiles';
  const message = tilesLeft < 3 
    ? `So close! You had ${tilesLeft} ${tileText} left. Try again?`
    : `Game Over!\n\nYou had ${tilesLeft} ${tileText} left. Try again?`;
  const congratsDiv = document.getElementById('congratsMessage');
  congratsDiv.innerHTML = message.replace(/\n/g, '<br>');
  congratsDiv.style.color = '#000000';
  
  // Hide all game input elements
  document.getElementById('message').textContent = '';
  document.getElementById('message').style.display = 'none';
  document.getElementById('playAgain').style.display = 'inline-block';
  document.getElementById('newHand').style.display = 'none';
  document.getElementById('giveUp').style.display = 'none';
  document.getElementById('submitWord').style.display = 'none';
  document.getElementById('clearInput').style.display = 'none';
  document.getElementById('wordDisplay').style.display = 'none';
  // Clear and disable inputs
  document.getElementById('submitWord').disabled = true;
  document.getElementById('wordDisplay').textContent = '';
  // Reset any active tiles
  document.querySelectorAll('.tile.active').forEach(tile => tile.classList.remove('active'));
}

function resetGame() {
  hasGameBeenSaved = false;
  console.log('Reset game - cleared saved flag');
  score = 0;
  hand = [];
  usedTiles = 0;
  document.getElementById('words-list').innerHTML = '';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('message').style.display = 'flex';
  document.getElementById('message').textContent = '';
  document.getElementById('congratsMessage').textContent = '';
  document.getElementById('wordDisplay').textContent = ''; // Clear the display
  document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';

  document.getElementById('playAgain').style.display = 'none';
  document.getElementById('newHand').style.display = 'inline-block';
  document.getElementById('giveUp').style.display = 'inline-block';
  document.getElementById('submitWord').style.display = 'inline-block';
  document.getElementById('clearInput').style.display = 'inline-block';
  document.getElementById('wordDisplay').style.display = 'block';
  document.getElementById('newHand').disabled = false;
  document.getElementById('giveUp').disabled = false;
  document.getElementById('submitWord').disabled = false;

  shuffleDeck();
  drawTiles();
}

function checkGameCompletion() {
  if (remainingLetters.length === 0 && hand.length === 0) {
    const progressPercent = Math.round((usedTiles / totalTiles) * 100);
    if (progressPercent === 100 && !hasGameBeenSaved) {
      console.log('Game completion check - Before bonus:', {
        score,
        usedTiles,
        totalTiles,
        progressPercent
      });
      score += 15;
      updateProgress();
      console.log('Game completion check - After bonus:', {
        score,
        usedTiles,
        totalTiles,
        progressPercent
      });
      // Save the score after adding bonus points
      saveGameScore('solitaire');
      
      // Create confetti
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 5000);
      }

      const message = `Congratulations! You've completed the game using ALL tiles! +15 bonus points!`;
      const congratsDiv = document.getElementById('congratsMessage');
      congratsDiv.textContent = message;
      congratsDiv.style.color = '#008000';
      
      document.getElementById('message').textContent = '';
      document.getElementById('message').style.display = 'none';
      document.getElementById('playAgain').style.display = 'inline-block';
      document.getElementById('newHand').style.display = 'none';
      document.getElementById('giveUp').style.display = 'none';
      document.getElementById('submitWord').style.display = 'none';
      document.getElementById('clearInput').style.display = 'none';
      document.getElementById('wordDisplay').style.display = 'none';
      document.getElementById('submitWord').disabled = true;
      document.getElementById('wordDisplay').textContent = '';
    }
  }
}

function updateTilesRemaining() {
  document.getElementById('tiles-remaining').textContent = `Tiles in bag: ${remainingLetters.length}`;
}

function renderHand() {
  const handDiv = document.getElementById('hand');
  handDiv.innerHTML = '';
  updateTilesRemaining();
  hand.forEach((tile, index) => {
    const tileDiv = document.createElement('div');
    tileDiv.className = tile.isNew ? 'tile dealing' : 'tile';
    tileDiv.textContent = tile.letter;
    tileDiv.dataset.index = index;
    if (tile.isNew) {
      setTimeout(() => tileDiv.classList.remove('dealing'), 500 + (index * 100));
    }
    const display = document.getElementById('wordDisplay');
    tileDiv.onclick = (e) => {
        const letter = tile.letter;
        if (tileDiv.classList.contains('active')) {
            const currentWord = display.textContent;
            const index = currentWord.indexOf(letter);
            if (index > -1) {
                display.textContent = currentWord.slice(0, index) + currentWord.slice(index + 1);
            }
            tileDiv.classList.remove('active');
        } else {
            const currentWord = display.textContent;
            const letterCount = hand.filter(t => t.letter === letter).length;
            const letterUsedCount = (currentWord.match(new RegExp(letter, 'g')) || []).length;

            if (letterUsedCount < letterCount) {
                display.textContent += letter;
                tileDiv.classList.add('active');
            } else {
                updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
            }
        }
    };
    handDiv.appendChild(tileDiv);
  });
}

function updateProgress() {
  const progressPercent = (usedTiles / totalTiles) * 100;
  document.getElementById('score').textContent = `Score: ${score} points`;
  document.getElementById('progress').innerHTML = `<div class="progress-bar"><div class="progress" style="width: ${progressPercent}%"></div></div> ${Math.round(progressPercent)}%`;
}

function canMakeWord(word) {
  const availableLetters = hand.map(tile => tile.letter);
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
    const index = hand.findIndex(tile => tile.letter === letter);
    if (index !== -1) hand.splice(index, 1);
  }
}

function getNewHand() {
  remainingLetters.push(...hand.map(tile => tile.letter));
  hand = [];
  score -= 1;
  updateProgress();
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
  const invalidWords = new Set(['HED', 'EDS', 'ENS', 'EMS', 'ELS', 'AES', 'ARS', 'UTS', 'TES', 'KI', 'YI', 'JAN', 'ZE', 'RI', 'UV', 'THOT', 'RAV', 'FY', 'SAV', 'ZOL', 'UNIX', 'UR', 'CRAN', 'QUEEF', 'CLIT', 'CUNT', 'OU', 'JOOK', 'BRU', 'FUCK', 'AU', 'JIP', 'AZN', 'IO', 'JEW', 'JAP', 'TIG', 'HUI', 'TIK', 'SPIC', 'SHIT', 'JAT', 'RON']);

  if (invalidWords.has(word)) {
    return false;
  }

  const commonWords = new Set(['THE', 'AN', 'A', 'IN', 'ON', 'AT', 'TO', 'FOR', 'OF', 'WITH', 'BY', 'AND', 'OR', 'BUT', 'NOT', 'IS', 'IT', 'BE', 'YOU', 'TOW', 'NET', 'SPINED', 'CUE', 'NUG', 'DUNK', 'OUR', 'ALL', 'ANY', 'CAN', 'HAS', 'HERE', 'THIS', 'THAT', 'WAS', 'WERE', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'SIFT']);

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

  li.addEventListener('click', function(e) {
    e.stopPropagation();
    if (window.innerWidth <= 768) {
      const wasActive = this.classList.contains('show-tooltip');
      document.querySelectorAll('.word-item').forEach(item => {
        item.classList.remove('show-tooltip');
      });
      if (!wasActive) {
        this.classList.add('show-tooltip');
      }
    }
  });

  // Add click handler to document to close tooltips
  if (!document.hasClickHandler) {
    document.addEventListener('click', function() {
      document.querySelectorAll('.word-item').forEach(item => {
        item.classList.remove('show-tooltip');
      });
    });
    document.hasClickHandler = true;
  }

  if (wordsList.firstChild) {
    wordsList.insertBefore(li, wordsList.firstChild);
  } else {
    wordsList.appendChild(li);
  }
}

let isSubmitting = false;

async function submitWord() {
  if (isSubmitting) return;
  
  const submitButton = document.getElementById('submitWord');
  const display = document.getElementById('wordDisplay');
  const word = display.textContent.toUpperCase();
  
  isSubmitting = true;
  submitButton.disabled = true;

  try {
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
        messageDiv.classList.remove('fade-out');
        messageDiv.innerHTML = 'Loading...';
        
        const img = new Image();
        img.onload = () => {
          const container = document.createElement('div');
          container.style.padding = "10px";
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.alignItems = "center";
          
          img.style.maxWidth = "250px";
          img.style.marginTop = "10px";
          img.style.display = "block";
          container.appendChild(img);

          const quoteText = document.createElement('div');
          quoteText.style.marginTop = "10px";
          quoteText.style.fontStyle = "italic";
          quoteText.textContent = "If a patient gets difficult, you QUONE him.";
          container.appendChild(quoteText);

          const invalidText = document.createElement('div');
          invalidText.style.marginTop = "5px";
          invalidText.textContent = "Not a valid word. Try again.";
          container.appendChild(invalidText);
          
          messageDiv.innerHTML = '';
          messageDiv.appendChild(container);
        };
        img.onerror = (e) => {
          console.error("Failed to load QUONE image:", e);
          img.src = "./images/quone.jpg";
          img.onerror = (e) => {
            console.error("Failed to load fallback QUONE image:", e);
            messageDiv.textContent = "QUONE!";
          };
        };
        img.src = "./images/quone.webp";
        img.alt = "QUONE";
      } else {
        updateMessage("Not a valid word");
      }
      display.textContent = ''; // Clear the display
      document.querySelectorAll('.tile.active').forEach(tile => tile.classList.remove('active'));
      return;
    }

    usedTiles += word.length;
    const points = word.length === 7 ? 15 : 
                  word.length === 6 ? 10 : 
                  word.length === 5 ? 7 : 
                  word.length === 4 ? 5 : 
                  word.length === 3 ? 3 : 2;
    score += points;

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
    display.textContent = ''; // Clear the display
    document.querySelectorAll('.tile.active').forEach(tile => tile.classList.remove('active'));
    checkGameCompletion();

    const definition = await getWordDefinition(word);
    addWordToHistory(word, definition);
  } finally {
    isSubmitting = false;
    document.getElementById('submitWord').disabled = false;
  }
}


document.getElementById('submitWord').onclick = submitWord;

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  modal.style.display = 'block';

  const confirmHandler = () => {
    modal.style.display = 'none';
    onConfirm();
    document.getElementById('modalConfirm').removeEventListener('click', confirmHandler);
  };

  document.getElementById('modalConfirm').addEventListener('click', confirmHandler);
  document.getElementById('modalCancel').onclick = () => {
    modal.style.display = 'none';
    document.getElementById('modalConfirm').removeEventListener('click', confirmHandler);
  };
}

document.getElementById('giveUp').onclick = () => {
  showConfirmModal(
    'Are you sure?',
    'Do you really want to give up?',
    () => endGame()
  );
};

document.getElementById('newHand').onclick = () => {
  showConfirmModal(
    'Deal New Hand?',
    'You will get 7 random new letter tiles. This will cost 1 point. Are you sure?',
    getNewHand
  );
};
document.getElementById('playAgain').onclick = resetGame;

// Clear input button
// Handle keyboard input
document.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') {
    const display = document.getElementById('wordDisplay');
    const lastLetter = display.textContent.slice(-1);
    if (lastLetter) {
      // Remove highlight from the last used tile of this letter
      const tiles = Array.from(document.querySelectorAll('.tile.active'));
      for (let i = tiles.length - 1; i >= 0; i--) {
        if (tiles[i].textContent === lastLetter) {
          tiles[i].classList.remove('active');
          break;
        }
      }
    }
    display.textContent = display.textContent.slice(0, -1);
    return;
  }

  if (event.key === 'Enter') {
    submitWord();
    return;
  }

  const letter = event.key.toUpperCase();
  if (letter.length === 1 && letter.match(/[A-Z]/)) {
    const letterCount = hand.filter(tile => tile.letter === letter).length;
    const display = document.getElementById('wordDisplay');
    const currentWord = display.textContent;
    const letterUsedCount = currentWord.split('').filter(l => l === letter).length;

    if (letterCount === 0) {
      updateMessage(`There is no '${letter}' in your hand`);
    } else if (letterUsedCount < letterCount) {
      display.textContent += letter;
      // Find and highlight the corresponding tile
      const tiles = document.querySelectorAll('.tile');
      for (let tile of tiles) {
        if (tile.textContent === letter && !tile.classList.contains('active')) {
          tile.classList.add('active');
          break;
        }
      }
    } else {
      updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
    }
  }
});

document.getElementById('clearInput').onclick = () => {
  document.getElementById('wordDisplay').textContent = ''; // Clear the display
  document.querySelectorAll('.tile.active').forEach(tile => tile.classList.remove('active'));
};

// Rules modal functionality
const rulesModal = document.getElementById('rulesModal');
const rulesBtn = document.getElementById('rulesBtn');
const closeRules = document.getElementById('closeRules');

rulesBtn.onclick = () => {
  rulesModal.style.display = 'block';
};

closeRules.onclick = () => {
  rulesModal.style.display = 'none';
};

window.onclick = (event) => {
  if (event.target === rulesModal) {
    rulesModal.style.display = 'none';
  }
};

shuffleDeck();
drawTiles();
displayPreviousScores();
document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';