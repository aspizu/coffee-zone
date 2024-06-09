import {Signal} from "@preact/signals"

export interface UserProps {
    username: Signal<string>
}

export function User({username}: UserProps) {
    return null
}
