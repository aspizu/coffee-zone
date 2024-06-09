import {session} from "~/session"
import {navigate} from "~/signal-router/location"

export function Settings() {
    if (!session.value) {
        navigate("/login", {replace: true})
        return null
    }
    return null
}
