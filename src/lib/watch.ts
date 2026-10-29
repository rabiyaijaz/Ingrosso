import "server-only"
import { cookies } from "next/headers"
import { LAB } from "./lab"

// Parts a buyer asked to hear about when they are back in stock.
export const WATCH_COOKIE = LAB ? "ig_lab_watch" : "ig_watch"

export async function readWatchList(): Promise<string[]> {
  try {
    const raw = (await cookies()).get(WATCH_COOKIE)?.value
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : []
  } catch {
    return []
  }
}