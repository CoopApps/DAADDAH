import { useState, useCallback, useRef } from "react";

/**
 * Internal state structure for history management.
 */
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/** Maximum number of history entries to keep */
const MAX_HISTORY = 50;
/** Maximum memory for history in megabytes */
const MAX_MEMORY_MB = 50;

// Rough estimate of object size in bytes
function estimateSize(obj: unknown): number {
  const seen = new WeakSet();

  function sizeOf(value: unknown): number {
    if (value === null || value === undefined) return 0;

    const type = typeof value;
    if (type === "boolean") return 4;
    if (type === "number") return 8;
    if (type === "string") return (value as string).length * 2;

    if (type === "object") {
      if (seen.has(value as object)) return 0;
      seen.add(value as object);

      if (Array.isArray(value)) {
        return value.reduce((acc, item) => acc + sizeOf(item), 0);
      }

      let size = 0;
      for (const key in value as Record<string, unknown>) {
        size += key.length * 2 + sizeOf((value as Record<string, unknown>)[key]);
      }
      return size;
    }

    return 0;
  }

  return sizeOf(obj);
}

/**
 * Custom hook for managing undo/redo history with memory limits.
 * Maintains a history of state changes that can be navigated with undo/redo.
 *
 * Features:
 * - Maximum 50 history entries
 * - Memory limit of 50MB to prevent runaway memory usage
 * - Full TypeScript support with generics
 *
 * @param initialState - The initial state value
 * @returns Object containing:
 *   - state: Current state value
 *   - set: Function to update state (adds to history)
 *   - undo: Function to undo last change
 *   - redo: Function to redo last undone change
 *   - reset: Function to reset history with new state
 *   - canUndo: Boolean indicating if undo is available
 *   - canRedo: Boolean indicating if redo is available
 *
 * @example
 * const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialGame);
 *
 * // Update state
 * set({ ...state, title: 'New Title' });
 *
 * // Undo/Redo
 * if (canUndo) undo();
 * if (canRedo) redo();
 */
export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track estimated memory usage
  const memorySizeRef = useRef(0);

  const set = useCallback((newPresent: T) => {
    setState((currentState) => {
      const newPast = [...currentState.past, currentState.present];

      // Estimate size of new entry
      const entrySize = estimateSize(currentState.present);
      memorySizeRef.current += entrySize;

      // Limit history size by count
      while (newPast.length > MAX_HISTORY) {
        const removed = newPast.shift();
        memorySizeRef.current -= estimateSize(removed);
      }

      // Also limit by memory (rough estimate)
      const maxBytes = MAX_MEMORY_MB * 1024 * 1024;
      while (memorySizeRef.current > maxBytes && newPast.length > 1) {
        const removed = newPast.shift();
        memorySizeRef.current -= estimateSize(removed);
      }

      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear future when making a new change
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) {
        return currentState; // Nothing to undo
      }

      const newPast = [...currentState.past];
      const newPresent = newPast.pop()!;
      const newFuture = [currentState.present, ...currentState.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) {
        return currentState; // Nothing to redo
      }

      const newFuture = [...currentState.future];
      const newPresent = newFuture.shift()!;
      const newPast = [...currentState.past, currentState.present];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
