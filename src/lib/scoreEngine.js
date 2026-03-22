import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

/**
 * CORE DISCOTIVE SCORE ENGINE
 * Handles all mathematical gamification and 24-hour delta tracking.
 */

// Master function to execute score mutations safely
export const mutateScore = async (userId, amount, reason) => {
  if (!userId || amount === 0) return;

  try {
    const userRef = doc(db, "users", userId);
    // Use Firebase's atomic increment to prevent race conditions
    await updateDoc(userRef, {
      "discotiveScore.current": increment(amount),
    });
    console.log(
      `[SCORE ENGINE] ${amount > 0 ? "+" : ""}${amount} PTS : ${reason}`,
    );
  } catch (error) {
    console.error("[SCORE ENGINE] Mutation Failed:", error);
  }
};

// --- ROADMAP EVENTS ---
export const awardTaskCompletion = (userId, isCompleted) => {
  // +5 for completing, -5 if they uncheck it (prevents point farming)
  mutateScore(userId, isCompleted ? 5 : -5, "Mini-task toggled");
};

export const awardNodeCompletion = (userId, nodeType) => {
  // +20 for core milestone, +10 for sub-branch
  const points = nodeType === "core" ? 20 : 10;
  mutateScore(userId, points, `${nodeType.toUpperCase()} Node Completed`);
};

// --- ASSET VAULT EVENTS ---
export const awardAssetVerification = (userId, strength) => {
  const points =
    strength === "strong"
      ? 15
      : strength === "medium"
        ? 10
        : strength === "weak"
          ? 5
          : 0;
  mutateScore(userId, points, `Asset Verified: ${strength}`);
};

// --- NETWORKING EVENTS ---
export const awardAllianceAction = (userId, actionType) => {
  const points =
    actionType === "sent_accepted"
      ? 2
      : actionType === "sent_rejected"
        ? -1
        : actionType === "received_any"
          ? 1
          : 0;
  mutateScore(userId, points, `Alliance Protocol: ${actionType}`);
};

// --- LEADERBOARD EVENTS ---
export const awardLeaderboardShift = (
  userId,
  positionChange,
  newRank,
  isGlobal,
) => {
  let points = 0;

  // 1. Calculate positional movement (+2 per up, -1 per down)
  if (positionChange > 0) points += positionChange * 2;
  if (positionChange < 0) points += positionChange * -1;

  // 2. Calculate Top 3 Bonuses
  if (newRank === 1) points += isGlobal ? 50 : 25;
  if (newRank === 2) points += isGlobal ? 30 : 15;
  if (newRank === 3) points += isGlobal ? 20 : 10;

  mutateScore(userId, points, `Leaderboard Shift: Rank ${newRank}`);
};

// --- DAILY LOGIN & 24H DELTA ENGINE ---
export const processDailyLogin = async (userId) => {
  if (!userId) return;

  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const scoreData = data.discotiveScore || {
      current: 0,
      last24h: 0,
      lastLoginDate: null,
    };

    const today = new Date().toISOString().split("T")[0];
    const lastLogin = scoreData.lastLoginDate;

    if (lastLogin === today) return; // Already logged in today

    let pointChange = 0;
    let reason = "";

    if (!lastLogin) {
      // First ever login (Signup bonus)
      pointChange = 50;
      reason = "OS Initialization Bonus";
    } else {
      // Calculate days missed
      const daysDifference = Math.floor(
        (new Date(today) - new Date(lastLogin)) / (1000 * 60 * 60 * 24),
      );

      if (daysDifference === 1) {
        pointChange = 10; // Consecutive day
        reason = "Daily Consistency";
      } else if (daysDifference > 1) {
        pointChange = -5 * (daysDifference - 1); // Penalty for missed days
        pointChange += 10; // Plus today's login
        reason = `Missed ${daysDifference - 1} days + Daily Login`;
      }
    }

    // Update the record: Set today as lastLogin, and snapshot the score for the 24h delta indicator
    await updateDoc(userRef, {
      "discotiveScore.current": increment(pointChange),
      "discotiveScore.last24h": scoreData.current, // Saves yesterday's final score for the arrow comparison!
      "discotiveScore.lastLoginDate": today,
    });

    console.log(`[SCORE ENGINE] Daily Login Processed: ${pointChange} PTS`);
  } catch (error) {
    console.error("[SCORE ENGINE] Daily Login Failed:", error);
  }
};
