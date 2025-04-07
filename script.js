const letterBag = {
  A: 4, B: 1, C: 1, D: 2, E: 4, F: 1, G: 1, H: 1,
  I: 4, J: 1, K: 1, L: 2, M: 1, N: 3, O: 4, P: 1,
  Q: 1, R: 3, S: 2, T: 3, U: 4, V: 1, W: 1, X: 1,
  Y: 1, Z: 1
};

// Uncomment for testing QUONE
// const letterBag = {
//   E: 2, O: 2, N: 2,
//   Q: 2, U: 2 
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
    const endMessage = game.endType === 'solitaire' ? 'Win! 100%' : `${game.tilesLeft} tiles left`;
    return `<li>${game.score} points (${endMessage}) - ${game.date}</li>`;
  }).join('');
}

function endGame(giveUp = false) {
  const progressPercent = Math.round((usedTiles / totalTiles) * 100);
  const endType = progressPercent === 100 ? 'solitaire' : 'incomplete';

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

  document.getElementById('playAgain').style.display = 'inline-block';
  document.getElementById('newHand').style.display = 'none';
  document.getElementById('giveUp').style.display = 'none';
  document.getElementById('submitWord').style.display = 'none';
  document.getElementById('submitWord').disabled = true;
  document.getElementById('wordDisplay').textContent = ''; // Clear the display

  if (giveUp || endType === 'solitaire') {
    saveGameScore(endType);
  }
}

function resetGame() {
  score = 0;
  hand = [];
  usedTiles = 0;
  document.getElementById('words-list').innerHTML = '';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('message').textContent = '';
  document.getElementById('wordDisplay').textContent = ''; // Clear the display
  document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';

  document.getElementById('playAgain').style.display = 'none';
  document.getElementById('newHand').style.display = 'inline-block';
  document.getElementById('giveUp').style.display = 'inline-block';
  document.getElementById('submitWord').style.display = 'inline-block';
  document.getElementById('newHand').disabled = false;
  document.getElementById('giveUp').disabled = false;
  document.getElementById('submitWord').disabled = false;
  document.getElementById('wordInput').disabled = false;

  shuffleDeck();
  drawTiles();
  // document.getElementById('wordInput').focus();  // Removed focus
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
  hand.forEach((tile, index) => {
    const tileDiv = document.createElement('div');
    tileDiv.className = tile.isNew ? 'tile dealing' : 'tile';
    tileDiv.textContent = tile.letter;
    tileDiv.dataset.index = index;
    if (tile.isNew) {
      setTimeout(() => tileDiv.classList.remove('dealing'), 500 + (index * 100));
    }
    tileDiv.onclick = () => {
        const display = document.getElementById('wordDisplay');
        const currentWord = display.textContent;
        const letter = tile.letter;
        const letterCount = hand.filter(t => t.letter === tile.letter).length;
        const letterUsedCount = currentWord.split('').filter(l => l === tile.letter).length;

        if (letterUsedCount < letterCount) {
            display.textContent += letter;
            tileDiv.classList.add('selected');
            setTimeout(() => tileDiv.classList.remove('selected'), 200);
        } else {
            updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
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
  remainingLetters.push(...hand);
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
  const invalidWords = new Set(['HED', 'EDS', 'ENS', 'EMS', 'ELS', 'AES', 'ARS', 'UTS', 'TES', 'KI', 'YI', 'JAN', 'ZE', 'RI', 'UV', 'THOT', 'RAV', 'FY', 'SAV', 'ZOL', 'UNIX', 'UR', 'CRAN', 'QUEEF', 'CLIT', 'CUNT', 'OU', 'JOOK', 'BRU', 'FUCK', 'AU', 'JIP']);

  if (invalidWords.has(word)) {
    return false;
  }

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

  li.addEventListener('click', function() {
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

  if (wordsList.firstChild) {
    wordsList.insertBefore(li, wordsList.firstChild);
  } else {
    wordsList.appendChild(li);
  }
}

async function submitWord() {
  const display = document.getElementById('wordDisplay');
  const word = display.textContent.toUpperCase();

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
        img.style.display = "block";
        messageDiv.appendChild(img);
      };
      img.onerror = (e) => {
        console.error("Failed to load QUONE image:", e);
        img.src = "images/quone.jpg";
      };
      img.src = "./images/quone.webp?" + new Date().getTime();
      img.alt = "QUONE";
    } else {
      updateMessage("Not a valid word");
    }
    display.textContent = ''; // Clear the display
    return;
  }

  usedTiles += word.length;
  const points = word.length === 7 ? 15 : 
                word.length === 6 ? 8 : 
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
  checkGameCompletion();

  const definition = await getWordDefinition(word);
  addWordToHistory(word, definition);
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
    'Do you really want to give up this game?',
    () => endGame(true)
  );
};

document.getElementById('newHand').onclick = () => {
  showConfirmModal(
    'Deal New Hand?',
    'This will cost 1 point. Are you sure?',
    getNewHand
  );
};
document.getElementById('playAgain').onclick = resetGame;

// Clear input button
// Handle keyboard input
document.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') {
    const display = document.getElementById('wordDisplay');
    display.textContent = display.textContent.slice(0, -1);
    return;
  }
  
  if (event.key === 'Enter') {
    submitWord();
    return;
  }

  const letter = event.key.toUpperCase();
  if (letter.length === 1 && letter.match(/[A-Z]/)) {
    const letterCount = hand.filter(l => l === letter).length;
    const display = document.getElementById('wordDisplay');
    const currentWord = display.textContent;
    const letterUsedCount = currentWord.split('').filter(l => l === letter).length;

    if (letterUsedCount < letterCount) {
      display.textContent += letter;
    } else {
      updateMessage(`You can only use "${letter}" ${letterCount} time${letterCount === 1 ? '' : 's'}`);
    }
  }
});

document.getElementById('clearInput').onclick = () => {
  document.getElementById('wordDisplay').textContent = ''; // Clear the display
};

shuffleDeck();
drawTiles();
displayPreviousScores();
document.getElementById('progress').innerHTML = '<div class="progress-bar"><div class="progress" style="width: 0%"></div></div> 0%';