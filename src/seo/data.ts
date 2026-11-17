/**
 * Search-engine copy for every page. Plain data with NO React imports, so the build
 * (vite.config.ts) can read it to make sitemap.xml and one static HTML file per address.
 *
 * Rules of thumb: title ≤ 45 characters (the brand name is added after it), description ≤ 160,
 * and write the way a teacher would type the search ("free printable word search maker").
 */

export const DEFAULT_SITE_URL = 'https://pencilfable.pages.dev'

export interface ToolSeo {
  /** Short, keyword-first. " | Pencilfable" is added automatically. */
  title: string
  description: string
  /** Two sentences shown on the tool page under "About this tool". */
  intro: string
  /** Three short tips shown on the tool page. */
  tips: [string, string, string]
}

export const TOOL_SEO: Record<string, ToolSeo> = {
  'word-search': {
    title: 'Free Printable Word Search Maker',
    description: 'Make a printable word search from your own word list in seconds. Choose the grid size and difficulty, add an answer key, then print or save a PDF. Free, no sign-up.',
    intro: 'Type your spelling or vocabulary words and get a ready-to-print word search with a word bank. Every puzzle is made on the spot, so you can press the button again for a brand-new one.',
    tips: ['Use 8–15 words for a quick warm-up and up to 30 for a challenge.', 'Pick a smaller grid for younger kids and a bigger one for older students.', 'Keep the answer key switched on so checking takes seconds.'],
  },
  'spelling-practice': {
    title: 'Free Printable Spelling Practice Sheets',
    description: 'Turn your weekly spelling list into printable practice sheets: look-cover-write-check or rainbow tracing. Print or save a PDF. Free, no account needed.',
    intro: 'Paste this week’s spelling words and choose a practice style. You get clean sheets with plenty of room to write, ready for the classroom or homework.',
    tips: ['Look, cover, write works well for words kids already know a little.', 'Rainbow tracing is great for early writers and new words.', 'Add your class name so the sheets come back to the right desk.'],
  },
  'word-scramble': {
    title: 'Free Printable Word Scramble Maker',
    description: 'Make a printable word scramble from your own words. Add hints and a word bank, include an answer key, then print or download a PDF. Free for teachers.',
    intro: 'Type your words and the letters are shuffled for you. Add a word bank or a hint to make the puzzle easier or harder.',
    tips: ['Show the word bank for beginners and hide it for a harder puzzle.', 'Turn on the first-letter hint to give struggling readers a helping hand.', 'Press New puzzle for a different scramble of the same words.'],
  },
  'matching-pairs': {
    title: 'Free Printable Matching Worksheet Maker',
    description: 'Create printable matching worksheets where kids draw a line to join each pair: words and meanings, questions and answers. Free, with an answer key.',
    intro: 'Enter your pairs, such as a word and its definition or a number and its name. The tool mixes up one side and lays out two neat columns for kids to connect.',
    tips: ['Keep to 6–10 pairs so everything fits on one page.', 'Pairs can be anything: synonyms, capitals, shapes, math facts.', 'The answer key shows every line already drawn.'],
  },
  'missing-letters': {
    title: 'Free Missing Letters Worksheet Maker',
    description: 'Make fill-in-the-missing-letters worksheets from your own word list. Hide a few letters or only the vowels, add a word bank and an answer key. Print for free.',
    intro: 'Type your words and the tool hides some of the letters for kids to find. Choose how many letters are missing, or hide only the vowels.',
    tips: ['Hide just one letter at first and build up to a lot.', 'Hiding only vowels is a gentle step for early spellers.', 'Turn on the word bank to make it a matching and spelling task.'],
  },
  'snowman-word-game': {
    title: 'Free Printable Snowman Word Game',
    description: 'Printable word-guessing game: guess the letters to build the snowman before it melts. Add your own words and clues. A friendly Hangman alternative.',
    intro: 'A gentle spelling game for the classroom or home. Add your words with a clue for each one, and print boards that kids play with just a pencil.',
    tips: ['Give every word a clue so kids can reason, not only guess.', 'Print two or four boards on a page to save paper.', 'Play in pairs: one picks the word, the other guesses.'],
  },
  'four-numbers-challenge': {
    title: 'Four Numbers Math Challenge (Printable)',
    description: 'A printable math game: use four numbers and + − × ÷ to reach the target. Choose the target and difficulty, print the puzzles with answers. Just paper and a pencil.',
    intro: 'Each puzzle gives four numbers and a target. Kids combine them with add, subtract, multiply and divide to hit the target, which builds number sense without worksheets feeling like worksheets.',
    tips: ['Start with target 10 and move up to 24 as kids improve.', 'Puzzles are checked so each one can be solved. Answers are in the answer key.', 'Make it a race: first to find a solution wins a point.'],
  },
  'math-drills': {
    title: 'Free Printable Math Worksheet Generator',
    description: 'Generate printable math drills: addition, subtraction, multiplication and division. Choose the biggest number and layout, get an answer key. Free, unlimited sheets.',
    intro: 'Pick the kind of math and how big the numbers should be, and get a fresh sheet of problems in one click. Press the button again whenever you need another worksheet.',
    tips: ['Keep the biggest number small for fact fluency practice.', 'Choose stacked problems for younger kids and in-a-line for older ones.', 'Use Mix to practise several operations on one page.'],
  },
  'kids-sudoku': {
    title: 'Free Printable Kids Sudoku (4×4 and 6×6)',
    description: 'Printable sudoku for kids with 4×4 and 6×6 grids, three difficulty levels and one answer each. Print several puzzles per page with answer keys. Free.',
    intro: 'Small grids make sudoku a friendly first logic puzzle. Every puzzle has exactly one solution, so kids can reason their way through without guessing.',
    tips: ['Start with 4×4 easy, then move to 6×6.', 'Print two or four puzzles on a page for a quiet-time folder.', 'The answer key makes checking fast for you.'],
  },
  'secret-code': {
    title: 'Free Printable Secret Code Breaker',
    description: 'Make a printable secret code puzzle: kids use the code key to crack your hidden message. Choose number or picture codes. Free, with an answer key.',
    intro: 'Write a secret message and the tool turns it into a code that kids decode with a key. It is a fun way to practise spelling, reading and careful matching.',
    tips: ['Use a short, silly message for younger children.', 'Number codes (A=1) suit older kids; picture codes suit younger ones.', 'Turn the message into a clue for a treasure hunt.'],
  },
  'clock-worksheets': {
    title: 'Free Printable Clock Worksheets',
    description: 'Printable telling-time worksheets: read the clock or draw the hands on blank clocks. Choose hour, half hour, quarters or 5 minutes. Free, with answer key.',
    intro: 'Make clock sheets to match what your class is learning. Kids either write the time they see or draw the hands to show a given time.',
    tips: ['Begin with hours and half hours, then add quarters.', 'Mix reading and drawing across two sheets for variety.', 'Use bigger clocks for kids who are just starting.'],
  },
  'mystery-picture': {
    title: 'Mystery Picture Math Coloring Sheets',
    description: 'Printable color-by-answer math puzzles: solve each square, color by the answer and reveal a secret picture. Free addition, subtraction and multiplication.',
    intro: 'Kids solve a math problem in every square, then color the square using the answer key. When every problem is right, a hidden picture appears.',
    tips: ['Choose the size of the answers to match your class level.', 'A wrong answer gives a wrong color, so the picture itself tells kids when to recheck.', 'A good calm-down activity for finished-early students.'],
  },
  maze: {
    title: 'Free Printable Maze Maker',
    description: 'Make a new printable maze every time: easy, medium or hard, with a solution page. Print or save a PDF. Free, unlimited mazes for kids.',
    intro: 'Press a button and get a brand-new maze that is guaranteed to have a way through. Choose how hard it should be and print the solution if you want it.',
    tips: ['Easy mazes are good for pre-writers practising pencil control.', 'Hard mazes make a nice brain break for older kids.', 'Print the solution page to check quickly.'],
  },
  'bingo-cards': {
    title: 'Free Printable Bingo Card Generator',
    description: 'Create unique printable bingo cards from your own words or numbers. Choose card size, free space and how many different cards. Free, no sign-up.',
    intro: 'Type your words or numbers and get as many different cards as you need, so every student has their own. Use it for vocabulary, sight words, math facts or holidays.',
    tips: ['Use more words than squares so every card is different.', 'Set How many different cards to one per student, plus a few spares.', 'Switch off the free space for a tougher game.'],
  },
  'sea-battle-game': {
    title: 'Printable Sea Battle Game (Ship Hunt)',
    description: 'A printable two-player grid game of hiding and finding ships. Choose 5×5, 8×8 or 10×10 grids. Just a printout and a pencil. Free for classrooms.',
    intro: 'Each player hides ships on a grid and takes turns guessing coordinates to find the other player’s fleet. It practises coordinates and logical thinking with no equipment at all.',
    tips: ['Use a 5×5 grid with younger kids for a quick game.', 'Pick letters and numbers to practise reading coordinates.', 'Print one sheet for each player so the grids stay secret.'],
  },
  'i-have-who-has': {
    title: 'Free “I Have… Who Has?” Card Maker',
    description: 'Make printable “I Have… Who Has?” cards from your own questions and answers. A whole-class listening game for any subject. Free, print or PDF.',
    intro: 'Every student holds one card that gives an answer and asks the next question, so the whole class has to listen to play. Enter your question and answer pairs and the cards are chained together for you.',
    tips: ['Write one question and one answer per line.', 'Make exactly as many cards as you have students.', 'It works for vocabulary, math facts, science and history.'],
  },
  'dice-maker': {
    title: 'Free Printable Dice Maker (Cut and Fold)',
    description: 'Make printable cut-and-fold dice with your own words, numbers or symbols. Add a second die, color the faces, choose the size. Free for the classroom.',
    intro: 'Design a six-sided die with any words, numbers or pictures on the faces. Print it, cut it, fold it and you have a custom game piece.',
    tips: ['Try question words (who, what, where) for speaking and writing games.', 'Add a second die to make combinations.', 'Print on card stock so the dice hold their shape.'],
  },
  'student-picker': {
    title: 'Random Student Picker and Group Maker',
    description: 'Spin the wheel to pick a student, or make fair random groups to print. Free classroom tool. Names stay in your browser and are never uploaded.',
    intro: 'Paste your class list to pick a student at random or split the class into groups. Your names are saved only in your own browser.',
    tips: ['Split by number of groups or by students per group.', 'Press the button again for a new set of groups.', 'Print the groups as a poster for the board.'],
  },
  'daily-schedule': {
    title: 'Free Printable Visual Daily Schedule',
    description: 'Make a picture daily routine poster that kids can follow on their own. Set activities and times, add tick circles. Free to print for home or class.',
    intro: 'A visual schedule helps children know what comes next and builds independence. Add your activities and times and print a clear poster.',
    tips: ['Put activities in the order they happen.', 'Add tick circles so kids can mark what they have done.', 'Display it at child height where everyone can see it.'],
  },
  'calendar-maker': {
    title: 'Free Printable Calendar Maker',
    description: 'Make a printable monthly calendar with room to write, or a whole year on one page. Choose the month, year and first day of the week. Free.',
    intro: 'Pick the month and year and print a clean calendar with plenty of space for notes. You can also print the whole year on a single page.',
    tips: ['Start the week on Sunday or Monday to suit your school.', 'Shade weekends so school days stand out.', 'Turn on the notes box for reminders and homework.'],
  },
}

/** Display names, used for the static HTML of each page. A test checks these against the tool registry. */
export const TOOL_NAMES: Record<string, string> = {
  'word-search': 'Word Search',
  'spelling-practice': 'Spelling Practice',
  'word-scramble': 'Word Scramble',
  'matching-pairs': 'Matching Pairs',
  'missing-letters': 'Missing Letters',
  'snowman-word-game': 'Snowman Word Game',
  'four-numbers-challenge': 'Four Numbers Challenge',
  'math-drills': 'Math Drill Sheets',
  'kids-sudoku': 'Kids Sudoku',
  'secret-code': 'Secret Code Breaker',
  'clock-worksheets': 'Clock Worksheets',
  'mystery-picture': 'Mystery Picture Math',
  maze: 'Maze Maker',
  'bingo-cards': 'Bingo Cards',
  'sea-battle-game': 'Sea Battle Game',
  'i-have-who-has': '"I Have… Who Has?"',
  'dice-maker': 'Dice Maker',
  'student-picker': 'Student Picker & Groups',
  'daily-schedule': 'Visual Daily Schedule',
  'calendar-maker': 'Calendar Maker',
}

export const LANDING_SEO = {
  title: '{APP} – Free Printable Games and Worksheets for Teachers',
  description: 'Make word searches, mazes, math games, bingo cards and more in seconds. Print or download a clean PDF. Free for teachers and homeschool, no account, nothing uploaded.',
}

export interface StaticPageSeo {
  path: string
  title: string
  description: string
}

/** Pages that are not tools. `/` and `/tools` are handled separately. */
export const DONATE_SEO: StaticPageSeo = {
  path: '/donate',
  title: 'Support {APP}',
  description: '{APP} is free for everyone. If it saves you time, you can say thanks with a small donation.',
}
