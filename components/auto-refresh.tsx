"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

const POLL_INTERVAL_MS = 10 * 60 * 1000
const STALE_THRESHOLD_MS = 5 * 60 * 1000

export function AutoRefresh() {
  const router = useRouter()
  const lastRefresh = useRef(Date.now())

  useEffect(() => {
    const refresh = () => {
      router.refresh()
      lastRefresh.current = Date.now()
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastRefresh.current > STALE_THRESHOLD_MS
      ) {
        refresh()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh()
      }
    }, POLL_INTERVAL_MS)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(interval)
    }
  }, [router])

  return null
}
