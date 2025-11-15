import { Animated, Easing } from 'react-native';
import type { AnimValue } from './types';

// Internal maps for timers and animation values.
// Provider uses these helpers to manage lifecycle/timers/animations.
const toastTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const toastAnimMap: Record<string, AnimValue> = {};

export const createId = () => Math.random().toString(36).substring(2, 9);

export const initAnim = (id: string): AnimValue => {
  if (!toastAnimMap[id]) {
    toastAnimMap[id] = new Animated.Value(0);
  }
  return toastAnimMap[id];
};

export const getAnim = (id: string): AnimValue | undefined => toastAnimMap[id];

export const animateIn = (anim: AnimValue) =>
  Animated.timing(anim, {
    toValue: 1,
    duration: 180,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }).start();

export const animateOut = (anim: AnimValue, onEnd?: () => void) =>
  Animated.timing(anim, {
    toValue: 0,
    duration: 160,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }).start(() => {
    onEnd?.();
  });

export const setTimer = (id: string, durationMs: number, cb: () => void) => {
  clearTimer(id);
  const t = setTimeout(() => {
    cb();
    delete toastTimers[id];
  }, durationMs);
  toastTimers[id] = t;
  return t;
};

export const clearTimer = (id: string) => {
  if (toastTimers[id]) {
    clearTimeout(toastTimers[id]);
    delete toastTimers[id];
  }
};

export const clearAllTimers = () => {
  Object.values(toastTimers).forEach(clearTimeout);
  for (const k in toastTimers) delete toastTimers[k];
};

export const deleteAnim = (id: string) => {
  if (toastAnimMap[id]) {
    delete toastAnimMap[id];
  }
};

export const clearAll = () => {
  clearAllTimers();
  for (const k in toastAnimMap) delete toastAnimMap[k];
};
