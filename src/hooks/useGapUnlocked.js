import { useSyncExternalStore } from 'react'
import {
  getGapUnlocked,
  subscribeGapUnlock,
} from '../lib/gapLock'

function getServerSnapshot() {
  return false
}

export function useGapUnlocked() {
  return useSyncExternalStore(subscribeGapUnlock, getGapUnlocked, getServerSnapshot)
}
