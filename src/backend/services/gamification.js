import GamificationStats from '../models/GamificationStats.js';
import GamificationEvent from '../models/GamificationEvent.js';

const STATS_ID = 'global';
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateToYmdUTC(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d.toISOString().slice(0, 10);
}

function parseYmdToUTC(ymd) {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function computeLevel(points) {
  return Math.max(1, Math.floor(points / 100) + 1);
}

function nextLevelAt(level) {
  return level * 100;
}

async function getOrCreateStats() {
  const existing = await GamificationStats.findById(STATS_ID);
  if (existing) return existing;
  return await GamificationStats.create({ _id: STATS_ID });
}

function updateStreak(stats, completionDay) {
  const lastDay = stats.lastCompletionDay;
  if (!lastDay) {
    stats.streakCount = 1;
    stats.lastCompletionDay = completionDay;
    return { streakCount: stats.streakCount, streakChanged: true };
  }

  if (lastDay === completionDay) {
    return { streakCount: stats.streakCount, streakChanged: false };
  }

  const last = parseYmdToUTC(lastDay);
  const current = parseYmdToUTC(completionDay);
  if (!last || !current) {
    stats.streakCount = 1;
    stats.lastCompletionDay = completionDay;
    return { streakCount: stats.streakCount, streakChanged: true };
  }

  const diffDays = Math.round((current - last) / MS_PER_DAY);
  if (diffDays === 1) {
    stats.streakCount += 1;
  } else {
    stats.streakCount = 1;
  }
  stats.lastCompletionDay = completionDay;
  return { streakCount: stats.streakCount, streakChanged: true };
}

function calcPointsForCompletion({ dueDateYmd, completedAt, streakCount }) {
  const base = 10;

  const completionDayUtc = parseYmdToUTC(dateToYmdUTC(completedAt));
  const dueDayUtc = parseYmdToUTC(dueDateYmd);

  let daysEarly = 0;
  if (completionDayUtc && dueDayUtc) {
    // Positive: finished before due date
    daysEarly = Math.max(0, Math.round((dueDayUtc - completionDayUtc) / MS_PER_DAY));
  }

  const earlyBonus = daysEarly * 3; // +3 per day early
  const comboBonus = Math.min(50, streakCount * 2);
  const gained = base + earlyBonus + comboBonus;

  return { gained, base, earlyBonus, comboBonus, daysEarly };
}

export async function awardForTaskCompletion(todo) {
  const stats = await getOrCreateStats();

  const completedAt = new Date();
  const completionDay = dateToYmdUTC(completedAt);

  const { streakCount } = updateStreak(stats, completionDay);
  const scoring = calcPointsForCompletion({
    dueDateYmd: todo?.date,
    completedAt,
    streakCount,
  });

  stats.points += scoring.gained;
  stats.level = computeLevel(stats.points);

  await stats.save();

  const eventId = `${todo?._id}-${completedAt.getTime()}`;
  await GamificationEvent.create({
    _id: eventId,
    postId: todo?._id,
    title: todo?.title ?? 'Untitled Task',
    date: todo?.date ?? '',
    gained: scoring.gained,
    breakdown: {
      base: scoring.base,
      earlyBonus: scoring.earlyBonus,
      comboBonus: scoring.comboBonus,
      daysEarly: scoring.daysEarly,
    },
    completionDay,
  });

  return {
    gained: scoring.gained,
    breakdown: {
      base: scoring.base,
      earlyBonus: scoring.earlyBonus,
      comboBonus: scoring.comboBonus,
      daysEarly: scoring.daysEarly,
    },
    stats: {
      points: stats.points,
      level: stats.level,
      streakCount: stats.streakCount,
      lastCompletionDay: stats.lastCompletionDay,
      nextLevelAt: nextLevelAt(stats.level),
    },
    completedAt,
    completionDay,
  };
}

export async function getStats() {
  const stats = await getOrCreateStats();
  stats.level = computeLevel(stats.points);
  await stats.save();

  return {
    points: stats.points,
    level: stats.level,
    streakCount: stats.streakCount,
    lastCompletionDay: stats.lastCompletionDay,
      nextLevelAt: nextLevelAt(stats.level),
  };
}

export async function getHistory(limit = 50) {
  const events = await GamificationEvent.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return events.map((e) => ({
    id: e._id,
    postId: e.postId,
    title: e.title,
    date: e.date,
    gained: e.gained,
    breakdown: e.breakdown,
    completionDay: e.completionDay,
    createdAt: e.createdAt,
  }));
}
