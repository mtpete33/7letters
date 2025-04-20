# 🔠 7Letters Solitaire

“A little luck, a little skill, a lotta fun.”  
— Mike

**7Letters** is a fast-paced, Scrabble-inspired solitaire word game where you try to use up all 50 tiles in the bag while scoring the highest point total possible.

Play it live: [7letters.replit.app](https://7letters.replit.app)

---

## 🎯 How to Play

- You start with **7 random letter tiles** in your hand.
- Make valid Scrabble words (2+ letters) from those tiles.
- When you submit a word, your hand refills from the remaining 43-letter tile bag.
- The goal? **Use all 50 tiles** and end with the highest score possible!

---

## 🧮 Scoring

| Word Length | Points  |
|-------------|---------|
| 2 letters   | 2 pts   |
| 3 letters   | 3 pts   |
| 4 letters   | 5 pts   |
| 5 letters   | 7 pts   |
| 6 letters   | 10 pts  |
| 7 letters   | 15 pts  |

---

## 💡 Tips & Strategy

- ✅ **Use hard letters early** (J, Q, X, Z) to avoid getting stuck at the end
- ✅ **Watch your vowel count** as the bag runs low
- ✅ **Use 2-letter words** like *QI*, *XI*, *ZA* when options are limited
- 🔄 **"Deal New Hand"** gives you a fresh set of letters from the bag (but doesn’t refill the bag)
- 📖 **Click on played words** to see their definitions

---

## 📦 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Game Logic:** JS-based letter bag & word validation
- **Word Check:** Words are validated using the [Free Dictionary API](https://dictionaryapi.dev/), combined with a custom word filter to ensure fair and consistent gameplay. Some common, valid words are manually **included** for reliability (like “THE,” “OUR,” and “DUNK”), while obscure, slang, or offensive words are **excluded** to keep the experience clean and focused on real Scrabble-style vocabulary.
- **Hosting:** Replit
- **Storage:** Local storage holding up to 10 previous scores to track your progress across games
- **Word Definitions:** Submitted word definitions are pulled from the Free Dictionary API

---

## 🎉 Why I Built It

I wanted to create a solitaire-style game that combined my love of word puzzles with just enough luck and skill involved to keep things interesting. The limited tile pool and score-driven gameplay make each run short, strategic, and satisfying — perfect for a quick brain break.

---

## 📬 Contact

- GitHub: [@mtpete33](https://github.com/mtpete33)
- Email: **mtpete33@gmail.com**

---

> Built for word nerds, puzzle lovers, and anyone who likes seeing how far 7 letters can take them.
