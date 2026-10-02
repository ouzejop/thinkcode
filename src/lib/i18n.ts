export type CoachLanguage = 'en' | 'fr';

export const i18n = {
  en: {
    app: {
      title: 'ThinkCode',
      tagline: 'The machine that makes you think.',
      pressStart: 'Press Start',
      continue: 'Continue',
      newGame: 'New Game',
    },
    nav: {
      shelf: 'Shelf',
      highScores: 'High Scores',
      report: 'Report',
      about: 'About',
      styleguide: 'Styleguide',
      settings: 'Settings',
    },
    ladder: {
      start: 'No help, full XP',
      think: 'A question to get you going',
      hint: 'A nudge, no spoilers',
      explain: 'The idea behind it',
      example: 'A similar solved problem',
      reveal: 'The full solution',
      btnThink: 'Think about it',
      btnHint: 'Give me a hint',
      btnExplain: 'Explain it',
      btnExample: 'Show an example',
      btnReveal: 'Reveal the answer',
    },
    coach: {
      speaker: 'Socrates.exe',
      empty: "Stuck? I won't solve it for you, but I'll get you unstuck.",
      thinking: 'Socrates is thinking…',
      answerPlaceholder: 'Write your thoughts or answer here…',
      submitAnswer: 'Send answer to Socrates',
      answerRequired: 'Write your answer first.',
    },
    status: {
      passed: 'Passed',
      notRun: 'Not run',
      failed: 'Failed',
      bonus: 'Bonus',
      rank: 'Rank',
      level: 'LV',
      xp: 'XP',
    },
  },
  fr: {
    coach: {
      speaker: 'Socrate.exe',
      empty: 'Bloqué ? Je ne résoudrai pas à ta place, mais je vais te débloquer.',
      thinking: 'Socrate réfléchit…',
      answerPlaceholder: 'Écris ta réflexion ou ta réponse ici…',
      submitAnswer: 'Envoyer à Socrate',
      answerRequired: "Écris d'abord ta réponse.",
    },
  },
};

export type I18nKey = keyof typeof i18n.en;
