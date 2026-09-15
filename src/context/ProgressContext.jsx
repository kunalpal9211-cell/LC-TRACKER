import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { PROBLEMS } from '../data/problems';

const ProgressContext = createContext(null);
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function calculateRealStreak(solvedObj) {
  if (!solvedObj || typeof solvedObj !== 'object') return { currentStreak: 0, bestStreak: 0 };
  
  const dateSet = new Set();
  Object.values(solvedObj).forEach(item => {
    if (item?.done && item?.solvedAt) {
      const d = new Date(item.solvedAt);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split('T')[0];
        dateSet.add(dateStr);
      }
    }
  });

  if (dateSet.size === 0) return { currentStreak: 0, bestStreak: 0 };

  const sortedDates = Array.from(dateSet).sort();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = dateSet.has(todayStr) ? today : (dateSet.has(yesterdayStr) ? yesterday : null);

  if (checkDate) {
    while (true) {
      const str = checkDate.toISOString().split('T')[0];
      if (dateSet.has(str)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let prevTime = null;

  sortedDates.forEach(dateStr => {
    const currTime = new Date(dateStr + 'T00:00:00Z').getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currTime - prevTime) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTime = currTime;
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  });

  return { currentStreak, bestStreak };
}

function loadInitialState(userId = 'guest') {
  const userKey = `spydex_progress_${userId}`;
  try {
    let raw = localStorage.getItem(userKey);
    // Only guest accounts may look at legacy guest key - authenticated accounts must never inherit guest solves!
    if (!raw && userId === 'guest') {
      raw = localStorage.getItem('spydex_progress_v2');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleanSolved = {};
        const cleanNotes = { ...(parsed.notes || {}) };
        const cleanRevision = { ...(parsed.revision || {}) };

        // Purge legacy mock data fingerprint if present from previous hardcoded state
        const isLegacyMockData = 
          cleanNotes['3sum'] === 'Used two pointers after sorting. Watch out for duplicates!' ||
          cleanNotes['trapping-rain-water'] === 'Monotonic decreasing stack approach. O(N) time.';

        const mockSlugs = ['two-sum', '3sum', 'trapping-rain-water'];
        if (isLegacyMockData) {
          mockSlugs.forEach(slug => {
            delete cleanNotes[slug];
            delete cleanRevision[slug];
          });
        }

        if (parsed.solved && typeof parsed.solved === 'object') {
          Object.entries(parsed.solved).forEach(([slug, val]) => {
            if (isLegacyMockData && mockSlugs.includes(slug)) {
              return;
            }
            // Purge leaked test solves fingerprint from previous testing session
            if (
              (slug === 'median-of-two-sorted-arrays' && val?.solvedAt === '2026-09-04T15:27:01.440Z') ||
              (slug === 'palindrome-number' && val?.solvedAt === '2026-09-04T17:57:22.290Z')
            ) {
              return;
            }
            if (val && val.done) {
              cleanSolved[slug] = {
                done: true,
                solvedAt: val.solvedAt || new Date().toISOString()
              };
            }
          });
        }
        const { currentStreak, bestStreak } = calculateRealStreak(cleanSolved);
        return {
          solved: cleanSolved,
          notes: cleanNotes,
          revision: cleanRevision,
          streak: currentStreak,
          bestStreak: Math.max(bestStreak, parsed.bestStreak || 0),
          lastActive: parsed.lastActive || null
        };
      }
    }
  } catch (err) {
    console.error('Failed loading progress from storage', err);
  }

  // Authentic Blank Canvas
  return {
    solved: {},
    notes: {},
    revision: {},
    streak: 0,
    bestStreak: 0,
    lastActive: null
  };
}

export function ProgressProvider({ children }) {
  const { user, setCloudSyncStatus } = useAuth();
  const userId = user?.id || 'guest';

  const [data, setData] = useState(() => loadInitialState(userId));

  // Sync with MongoDB Atlas backend whenever data changes and user is authenticated
  const syncWithBackend = useCallback(async (currentData) => {
    if (!user || user.isGuest) return;
    try {
      setCloudSyncStatus('syncing');
      const totalCount = Object.keys(currentData.solved || {}).length;
      const res = await fetch(`${API_BASE}/api/progress/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solved: currentData.solved || {},
          revision: currentData.revision || {},
          notes: currentData.notes || {},
          streak: currentData.streak || 0,
          bestStreak: currentData.bestStreak || 0,
          totalSolved: totalCount,
          email: user.email || '',
          avatar: user.avatar || '/avatars/spiderman.svg',
          name: user.name || ''
        })
      });
      if (res.ok) {
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('local');
      }
    } catch {
      setCloudSyncStatus('local');
    }
  }, [user, setCloudSyncStatus]);

  // Switch dataset and bi-directionally sync with MongoDB Atlas when user logs in or out
  useEffect(() => {
    if (!user || user.isGuest) {
      setData(loadInitialState('guest'));
      setCloudSyncStatus('synced');
      return;
    }

    // 1. Immediately render cached progress for this user
    const local = loadInitialState(user.id);
    setData(local);

    // 2. Fetch authoritative records from MongoDB Atlas
    let isCurrent = true;
    (async () => {
      try {
        setCloudSyncStatus('syncing');
        const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
        const res = await fetch(`${API_BASE}/api/progress/${user.id}${emailParam}`);
        if (res.ok && isCurrent) {
          const backendData = await res.json();
          
          // Clean contaminated test timestamps if present from backend
          const backendSolved = { ...(backendData?.solved || {}) };
          if (backendSolved['median-of-two-sorted-arrays']?.solvedAt === '2026-09-04T15:27:01.440Z') {
            delete backendSolved['median-of-two-sorted-arrays'];
          }
          if (backendSolved['palindrome-number']?.solvedAt === '2026-09-04T17:57:22.290Z') {
            delete backendSolved['palindrome-number'];
          }

          const backendSolvedCount = Object.keys(backendSolved).length;
          const backendNotesCount = Object.keys(backendData?.notes || {}).length;
          const backendRevCount = Object.keys(backendData?.revision || {}).length;
          const hasAtlasData = backendSolvedCount > 0 || backendNotesCount > 0 || backendRevCount > 0;

          // Merge local and Atlas: union of all solved problems and records
          const mergedSolved = { ...(local.solved || {}), ...backendSolved };
          const mergedNotes = { ...(local.notes || {}), ...(backendData.notes || {}) };
          const mergedRevision = { ...(local.revision || {}), ...(backendData.revision || {}) };

          const { currentStreak, bestStreak } = calculateRealStreak(mergedSolved);
          const computedBestStreak = Math.max(
            bestStreak,
            local.bestStreak || 0,
            backendData.bestStreak || 0
          );

          const merged = {
            solved: mergedSolved,
            notes: mergedNotes,
            revision: mergedRevision,
            streak: currentStreak,
            bestStreak: computedBestStreak,
            lastActive: new Date().toISOString()
          };

          setData(merged);
          localStorage.setItem(`spydex_progress_${user.id}`, JSON.stringify(merged));
          setCloudSyncStatus('synced');

          // If local had items not yet in Atlas (first login or solved offline), push to Atlas!
          const mergedSolvedCount = Object.keys(mergedSolved).length;
          if (mergedSolvedCount > backendSolvedCount || !hasAtlasData) {
            if (mergedSolvedCount > 0 || Object.keys(mergedNotes).length > 0) {
              syncWithBackend(merged);
            }
          }
          return;
        }
      } catch (e) {
        console.warn('Atlas progress sync notice:', e);
      }
      if (isCurrent) {
        setCloudSyncStatus('local');
      }
    })();

    return () => { isCurrent = false; };
  }, [user?.id, user?.isGuest, setCloudSyncStatus]);

  // Persist to user-scoped localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`spydex_progress_${userId}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed saving progress to localStorage', e);
    }
  }, [data, userId]);

  // Toggle problem solved
  const toggleSolved = (slug) => {
    setData(prev => {
      const isDone = Boolean(prev.solved[slug]?.done);
      const nextSolved = { ...prev.solved };
      if (isDone) {
        delete nextSolved[slug];
      } else {
        nextSolved[slug] = { done: true, solvedAt: new Date().toISOString() };
      }
      const { currentStreak, bestStreak } = calculateRealStreak(nextSolved);
      const updated = {
        ...prev,
        solved: nextSolved,
        streak: currentStreak,
        bestStreak: Math.max(prev.bestStreak || 0, bestStreak),
        lastActive: new Date().toISOString()
      };
      syncWithBackend(updated);
      return updated;
    });
  };

  // Set / Remove revision category
  const setRevision = (slug, category) => {
    setData(prev => {
      const nextRev = { ...prev.revision };
      if (!category) {
        delete nextRev[slug];
      } else {
        const existing = nextRev[slug] || {};
        nextRev[slug] = {
          category,
          addedAt: existing.addedAt || new Date().toISOString(),
          lastReviewed: existing.lastReviewed || new Date().toISOString(),
          reviewCount: (existing.reviewCount || 0) + 1,
          interval: existing.interval || 1
        };
      }
      const updated = { ...prev, revision: nextRev };
      syncWithBackend(updated);
      return updated;
    });
  };

  // Save note
  const saveNote = (slug, note) => {
    setData(prev => {
      const nextNotes = { ...prev.notes };
      if (note && note.trim()) {
        nextNotes[slug] = note.trim();
      } else {
        delete nextNotes[slug];
      }
      const updated = { ...prev, notes: nextNotes };
      syncWithBackend(updated);
      return updated;
    });
  };

  // Mark reviewed in Spaced Repetition (increment interval: 1d -> 4d -> 10d -> 30d)
  const markReviewed = (slug) => {
    setData(prev => {
      const existing = prev.revision[slug];
      if (!existing) return prev;
      const nextInterval = existing.interval === 1 ? 4 : existing.interval === 4 ? 10 : 30;
      const nextRev = {
        ...prev.revision,
        [slug]: {
          ...existing,
          lastReviewed: new Date().toISOString(),
          reviewCount: (existing.reviewCount || 0) + 1,
          interval: nextInterval
        }
      };
      const updated = { ...prev, revision: nextRev };
      syncWithBackend(updated);
      return updated;
    });
  };

  const totalSolved = Object.keys(data.solved).length;
  const totalProblems = PROBLEMS.length;
  const solvedPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 1000) / 10 : 0;

  return (
    <ProgressContext.Provider
      value={{
        solved: data.solved,
        revision: data.revision,
        notes: data.notes,
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0,
        toggleSolved,
        setRevision,
        saveNote,
        markReviewed,
        syncCloud: () => syncWithBackend(data),
        totalSolved,
        totalProblems,
        solvedPercent
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
