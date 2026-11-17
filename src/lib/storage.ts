import { useCallback, useEffect, useRef, useState } from 'react'

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage can be blocked (private mode) – the app must keep working */
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** useState that survives page reloads. Re-reads when `key` changes (e.g. switching tools). */
export function usePersistentState<T extends object>(key: string, initial: T) {
  const initialRef = useRef(initial)
  const [state, setState] = useState<T>(() => readJson(key, initialRef.current))
  const [loadedKey, setLoadedKey] = useState(key)

  if (loadedKey !== key) {
    setLoadedKey(key)
    setState(readJson(key, initialRef.current))
  }

  useEffect(() => {
    if (loadedKey === key) writeJson(key, state)
  }, [key, loadedKey, state])

  const patch = useCallback((p: Partial<T>) => setState((s) => ({ ...s, ...p })), [])
  return [state, patch, setState] as const
}
