export const REMINDER_INTERVAL_MINUTES = 10;

// OPEN QUESTION for the product owner: when should the asking stop? Default: when the next prayer's time begins, and the
// prayer is then logged as missed. Set to false to keep asking for REMINDER_MAX_MINUTES_WITHOUT_STOP after the prayer
// time and never log a missed prayer by itself.
export const REMINDER_STOPS_AT_NEXT_PRAYER = true;
export const REMINDER_MAX_MINUTES_WITHOUT_STOP = 12 * 60;

// Days of asks planned ahead. iOS keeps 64 pending notifications, so a short window leaves room for the repeats.
export const REMINDER_DAYS_AHEAD = 3;
export const REMINDER_IOS_BUDGET = 60;
export const REMINDER_ANDROID_BUDGET = 250;

// How long an answer ("Not yet", a close) keeps pushing the next ask back, in days, before it is forgotten.
export const REMINDER_MEMORY_DAYS = 2;
