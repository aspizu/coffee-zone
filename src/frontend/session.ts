import {ReadonlySignal, signal} from "@preact/signals"
import type {Session} from "~/api"
import {get_session} from "~/api"

const _session = signal<Session | null>(null)
export const session: ReadonlySignal<Session | null> = _session

export async function fetchSession() {
    const session = await get_session()
    if (session.ok) {
        _session.value = session.value
    } else {
        _session.value = null
    }
}
