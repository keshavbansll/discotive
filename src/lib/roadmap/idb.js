/**
 * @fileoverview Discotive Roadmap — IndexedDB Layer (Singleton)
 *
 * Fixed issues vs original:
 *  - openIDB() was called on every write → opened a new IDB connection every debounce tick.
 *    Now the DB promise is cached in module scope — one connection for the app's lifetime.
 *  - Added timestamp tracking for conflict detection (cloud vs local).
 */

import { IDB_DB_NAME, IDB_STORE } from "./constants.js";

/** Module-scope singleton promise. Resolves once and reuses forever. */
let _dbPromise = null;

const getDB = () => {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE, { keyPath: "uid" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => {
      _dbPromise = null; // allow retry on next call
      reject(req.error);
    };
    req.onblocked = () => {
      console.warn(
        "[IDB] Connection blocked — another tab may have an older version open.",
      );
    };
  });
  return _dbPromise;
};

/**
 * @function idbPut
 * @param {string} uid
 * @param {{ nodes: object[], edges: object[] }} payload
 * @param {number} [cloudTs] — epoch ms of the latest cloud save, for conflict detection.
 * Fire-and-forget: failures are swallowed so they never block the optimistic UI path.
 */
export const idbPut = async (uid, payload, cloudTs) => {
  try {
    const db = await getDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({
      uid,
      nodes: payload.nodes || [],
      edges: payload.edges || [],
      localTs: Date.now(),
      cloudTs: cloudTs ?? null,
    });
  } catch (err) {
    console.warn("[IDB] Write failed:", err);
  }
};

/**
 * @function idbGet
 * @param {string} uid
 * @returns {Promise<{ nodes: object[], edges: object[], localTs: number, cloudTs: number|null } | null>}
 */
export const idbGet = async (uid) => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(uid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * @function idbClear
 * @param {string} uid — Clears local cache for this user (e.g. after account deletion).
 */
export const idbClear = async (uid) => {
  try {
    const db = await getDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(uid);
  } catch (err) {
    console.warn("[IDB] Clear failed:", err);
  }
};
