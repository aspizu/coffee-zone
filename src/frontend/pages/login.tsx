import {useComputed, useSignal} from "@preact/signals"
import {LoginResult, login} from "~/api"
import {Input} from "~/components/input"
import {passwordValidator, usernameValidator} from "~/models"
import {fetchSession, isLoggedIn} from "~/session"
import {navigate} from "~/signal-router/location"

export function Login() {
    const loading = useSignal(false)
    if (isLoggedIn()) {
        navigate("/")
    }
    const username = useSignal("")
    const usernameError = useSignal<string | undefined>(undefined)
    const password = useSignal("")
    const passwordError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (loading.value) return true
        if (usernameValidator(username.value)) return true
        if (passwordValidator(password.value)) return true
        return false
    })
    async function onLogin() {
        loading.value = true
        const result = await login({
            username: username.value,
            password: password.value,
        })
        if (!result.ok) {
            console.error(result.value)
        } else if (result.value === LoginResult.OK) {
            await fetchSession()
        } else if (result.value === LoginResult.INCORRECT_PASSWORD) {
            passwordError.value = "Invalid password."
        } else if (result.value === LoginResult.VERIFICATION_REQUIRED) {
            navigate("/verify")
            return
        }
        loading.value = false
    }
    return (
        <div class="form">
            <Input
                label="Username"
                help="Lowercase alphabets only. Atleast 3 characters. Maximum 64 characters."
                value={username}
                error={usernameError}
                validator={usernameValidator}
            />
            <Input
                password
                label="Password"
                help="Atleast 8 characters. Whitespace will be trimmed."
                value={password}
                error={passwordError}
                validator={passwordValidator}
            />
            <button class="form__button button" disabled={invalid} onClick={onLogin}>
                {loading.value && <div class="spinner spinner--inverted" />}
                Login
            </button>
        </div>
    )
}
