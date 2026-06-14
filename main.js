import './style.css';
import { wordData } from './words.js';

// --- State Variables ---
let currentChapter = null;
let currentMode = null;
let wordList = [];
let currentIndex = 0;
let score = 0;

// --- DOM Elements ---
const views = document.querySelectorAll('.view');
const btnHome = document.getElementById('btn-home');

// Views
const viewHome = document.getElementById('view-home');
const viewModeSelect = document.getElementById('view-mode-select');
const viewAllWords = document.getElementById('view-all-words');
const viewFlashcard = document.getElementById('view-flashcard');
const viewQuiz = document.getElementById('view-quiz');
const viewSpelling = document.getElementById('view-spelling');
const viewResult = document.getElementById('view-result');

// Home
const chapterList = document.getElementById('chapter-list');
const btnAllWords = document.getElementById('btn-all-words');

// Mode Select
const selectedChapterTitle = document.getElementById('selected-chapter-title');
const modeButtons = document.querySelectorAll('.mode-btn');

// All Words
const allWordsContainer = document.getElementById('all-words-container');

// Flashcard
const fcWordEn = document.getElementById('fc-word-en');
const fcWordKo = document.getElementById('fc-word-ko');
const flashcard = document.getElementById('flashcard');
const flashcardInner = document.querySelector('.flashcard-inner');
const fcProgress = document.getElementById('fc-progress');
const fcProgressText = document.getElementById('fc-progress-text');
const btnFcNext = document.getElementById('btn-fc-next');
const btnFcSkip = document.getElementById('btn-fc-skip');

// Quiz
const qzWordEn = document.getElementById('qz-word-en');
const qzOptions = document.getElementById('qz-options');
const qzProgress = document.getElementById('qz-progress');
const qzProgressText = document.getElementById('qz-progress-text');
const qzFeedback = document.getElementById('qz-feedback');
const btnQzNext = document.getElementById('btn-qz-next');

// Spelling
const spWordKo = document.getElementById('sp-word-ko');
const spInput = document.getElementById('sp-input');
const spProgress = document.getElementById('sp-progress');
const spProgressText = document.getElementById('sp-progress-text');
const spFeedback = document.getElementById('sp-feedback');
const btnSpSubmit = document.getElementById('btn-sp-submit');
const btnSpNext = document.getElementById('btn-sp-next');

// Result
const resultMsg = document.getElementById('result-msg');
const btnResultHome = document.getElementById('btn-result-home');


// --- Utility Functions ---
function switchView(viewElement) {
  views.forEach(v => v.classList.remove('active'));
  viewElement.classList.add('active');
  
  if (viewElement === viewHome) {
    btnHome.classList.add('hide');
  } else {
    btnHome.classList.remove('hide');
  }
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// --- Initialization ---
function init() {
  // Generate chapter buttons
  const chapters = Object.keys(wordData).sort((a, b) => parseInt(a) - parseInt(b));
  chapters.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.innerText = `${ch}번`;
    btn.onclick = () => selectChapter(ch);
    chapterList.appendChild(btn);
  });

  // Generate all words list
  chapters.forEach(ch => {
    const chHeader = document.createElement('div');
    chHeader.className = 'chapter-header';
    chHeader.innerText = `${ch}번`;
    allWordsContainer.appendChild(chHeader);

    wordData[ch].forEach(word => {
      const item = document.createElement('div');
      item.className = 'word-item';
      item.innerHTML = `<span class="word-item-en">${word.en}</span><span class="word-item-ko">${word.ko}</span>`;
      allWordsContainer.appendChild(item);
    });
  });

  // Event Listeners
  btnHome.onclick = () => switchView(viewHome);
  btnAllWords.onclick = () => switchView(viewAllWords);
  btnResultHome.onclick = () => switchView(viewHome);
  
  modeButtons.forEach(btn => {
    btn.onclick = (e) => {
      currentMode = e.target.dataset.mode;
      if (e.target.dataset.chapter) {
        currentChapter = e.target.dataset.chapter;
      }
      startMode();
    };
  });

  // Flashcard Events
  flashcard.onclick = () => {
    flashcardInner.classList.toggle('is-flipped');
  };
  btnFcNext.onclick = () => {
    if (currentIndex < wordList.length - 1) {
      currentIndex++;
      updateFlashcard();
    } else {
      showResult();
    }
  };
  btnFcSkip.onclick = () => {
    if (currentIndex < wordList.length) {
      wordList.push(wordList[currentIndex]);
      currentIndex++;
      updateFlashcard();
    }
  };

  // Quiz Events
  btnQzNext.onclick = () => {
    if (currentIndex < wordList.length - 1) {
      currentIndex++;
      updateQuiz();
    } else {
      showResult();
    }
  };

  // Spelling Events
  btnSpSubmit.onclick = checkSpelling;
  spInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      if (btnSpNext.classList.contains('hide')) {
        checkSpelling();
      } else {
        btnSpNext.click();
      }
    }
  };
  btnSpNext.onclick = () => {
    if (currentIndex < wordList.length - 1) {
      currentIndex++;
      updateSpelling();
    } else {
      showResult();
    }
  };
}

// --- Logic ---
function selectChapter(ch) {
  currentChapter = ch;
  selectedChapterTitle.innerText = `${ch}번 단어`;
  switchView(viewModeSelect);
}

function startMode() {
  if (currentChapter === 'all') {
    let allWordsList = [];
    Object.values(wordData).forEach(list => allWordsList.push(...list));
    wordList = shuffle(allWordsList);
  } else {
    wordList = shuffle([...wordData[currentChapter]]);
  }
  currentIndex = 0;
  score = 0;

  if (currentMode === 'flashcard') {
    switchView(viewFlashcard);
    updateFlashcard();
  } else if (currentMode === 'quiz') {
    switchView(viewQuiz);
    updateQuiz();
  } else if (currentMode === 'spelling') {
    switchView(viewSpelling);
    updateSpelling();
  }
}

// Flashcard Mode
function updateFlashcard() {
  flashcardInner.classList.remove('is-flipped');
  setTimeout(() => {
    const word = wordList[currentIndex];
    fcWordEn.innerText = word.en;
    fcWordKo.innerText = word.ko;
    
    fcProgressText.innerText = `${currentIndex + 1} / ${wordList.length}`;
    fcProgress.style.width = `${((currentIndex + 1) / wordList.length) * 100}%`;
    
    btnFcNext.innerText = currentIndex === wordList.length - 1 ? '완료 🎉' : '알아요 (다음) ▶';
  }, 150); // wait for flip animation if it was flipped
}

// Quiz Mode
function updateQuiz() {
  const word = wordList[currentIndex];
  qzWordEn.innerText = word.en;
  qzOptions.innerHTML = '';
  qzFeedback.classList.add('hide');
  btnQzNext.classList.add('hide');
  
  qzProgressText.innerText = `${currentIndex + 1} / ${wordList.length}`;
  qzProgress.style.width = `${((currentIndex + 1) / wordList.length) * 100}%`;

  // Get 3 random wrong options
  let allWords = [];
  Object.values(wordData).forEach(list => allWords.push(...list));
  allWords = allWords.filter(w => w.ko !== word.ko);
  allWords = shuffle(allWords).slice(0, 3);
  
  const options = shuffle([word, ...allWords]);
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.ko;
    btn.onclick = () => checkQuiz(btn, opt.ko === word.ko);
    qzOptions.appendChild(btn);
  });
}

function checkQuiz(selectedBtn, isCorrect) {
  // Disable all buttons
  const buttons = qzOptions.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    qzFeedback.innerText = '정답입니다! 🎉';
    qzFeedback.className = 'feedback-msg correct';
    score++;
  } else {
    selectedBtn.classList.add('wrong');
    qzFeedback.innerText = '아쉽네요! 오답입니다 💦';
    qzFeedback.className = 'feedback-msg wrong';
    // Highlight correct option
    buttons.forEach(b => {
      if (b.innerText === wordList[currentIndex].ko) {
        b.classList.add('correct');
      }
    });
    // 오답 시 리스트 맨 뒤에 추가
    wordList.push(wordList[currentIndex]);
  }
  
  qzFeedback.classList.remove('hide');
  btnQzNext.classList.remove('hide');
  btnQzNext.innerText = currentIndex === wordList.length - 1 ? '결과 보기 🎉' : '다음 문제 ▶';
}

// Spelling Mode
function updateSpelling() {
  const word = wordList[currentIndex];
  spWordKo.innerText = word.ko;
  spInput.value = '';
  spInput.className = 'cute-input';
  spInput.disabled = false;
  spInput.focus();
  
  spFeedback.classList.add('hide');
  btnSpNext.classList.add('hide');
  btnSpSubmit.classList.remove('hide');
  
  spProgressText.innerText = `${currentIndex + 1} / ${wordList.length}`;
  spProgress.style.width = `${((currentIndex + 1) / wordList.length) * 100}%`;
}

function checkSpelling() {
  const word = wordList[currentIndex];
  const userAnswer = spInput.value.trim().toLowerCase();
  const correctAnswer = word.en.toLowerCase();
  
  spInput.disabled = true;
  btnSpSubmit.classList.add('hide');

  if (userAnswer === correctAnswer) {
    spInput.classList.add('correct');
    spFeedback.innerText = '정답입니다! 🎉';
    spFeedback.className = 'feedback-msg correct';
    score++;
  } else {
    spInput.classList.add('wrong');
    spFeedback.innerText = `오답입니다! 정답은: ${word.en}`;
    spFeedback.className = 'feedback-msg wrong';
    // 오답 시 리스트 맨 뒤에 추가
    wordList.push(wordList[currentIndex]);
  }
  
  spFeedback.classList.remove('hide');
  btnSpNext.classList.remove('hide');
  btnSpNext.innerText = currentIndex === wordList.length - 1 ? '결과 보기 🎉' : '다음 문제 ▶';
}

// Result
function showResult() {
  switchView(viewResult);
  
  if (currentMode === 'flashcard') {
    resultMsg.innerText = '수고하셨습니다! 끝까지 해냈어요! 💖';
  } else {
    if (score === wordList.length) {
      resultMsg.innerText = '완벽해요! 💯 백점만점! 💖';
    } else if (score >= wordList.length / 2) {
      resultMsg.innerText = '참 잘했어요! 💖 조금만 더 연습해봐요!';
    } else {
      resultMsg.innerText = '화이팅! 💪 다시 한 번 도전해볼까요?';
    }
  }
}

// Initialize on load
init();
