import {ReadonlySignal, signal} from "@preact/signals"
import type {Session} from "~/api"
import {get_session} from "~/api"

const _session = signal<Session | "logged-out" | "loading">("loading")
export const session: ReadonlySignal<Session | "logged-out" | "loading"> = _session

export async function fetchSession() {
    slowLoad.value = false
    const timeout = setTimeout(() => {
        slowLoad.value = true
    }, 10 * 1000)
    const session = await get_session()
    clearTimeout(timeout)
    slowLoad.value = false
    if (session.ok) {
        _session.value = session.value ?? "logged-out"
    } else {
        _session.value = "loading"
    }
}

export function isLoggedIn() {
    return typeof session.value !== "string"
}

export function isLoggedOut() {
    return session.value === "logged-out"
}

export const slowLoad = signal(false)
