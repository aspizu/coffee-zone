import {useComputed, useSignal} from "@preact/signals"
import {RegisterError, register} from "~/api"
import {Input} from "~/components/input"
import {emailValidator, passwordValidator, usernameValidator} from "~/models"
import {fetchSession, isLoggedIn} from "~/session"
import {navigate} from "~/signal-router/location"

export function Register() {
    if (isLoggedIn()) {
        navigate("/")
    }
    const loading = useSignal(false)
    const username = useSignal("")
    const usernameError = useSignal<string | undefined>(undefined)
    const password = useSignal("")
    const passwordError = useSignal<string | undefined>(undefined)
    const passwordConfirmation = useSignal("")
    const passwordConfirmationError = useSignal<string | undefined>(undefined)
    const email = useSignal("")
    const emailError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (loading.value) return true
        if (usernameValidator(username.value)) return true
        if (passwordValidator(password.value)) return true
        if (passwordConfirmationValidator(passwordConfirmation.value)) return true
        if (emailValidator(email.value)) return true
        return false
    })
    function passwordConfirmationValidator(passwordConfirmation: string) {
        if (password.value !== passwordConfirmation) {
            return "Passwords do not match."
        }
    }
    async function onRegister() {
        loading.value = true
        const result = await register({
            username: username.value,
            password: password.value,
            email: email.value,
        })
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (result.value.ok) {
            await fetchSession()
            return
        }
        loading.value = false
        if (result.value.value === RegisterError.EMAIL_TAKEN) {
            emailError.value = "Email is already taken."
            return
        }
        if (result.value.value === RegisterError.USERNAME_TAKEN) {
            usernameError.value = "Username is already taken."
            return
        }
        console.error(result.value)
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
            <Input
                password
                label="Password Confirmation"
                help="Please confirm your password."
                value={passwordConfirmation}
                error={passwordConfirmationError}
                validator={passwordConfirmationValidator}
            />
            <Input
                label="Email"
                help="Email will be verified."
                value={email}
                error={emailError}
                validator={emailValidator}
            />
            <button class="form__button button" disabled={invalid} onClick={onRegister}>
                {loading.value && <div class="spinner spinner--inverted" />}
                Register
            </button>
        </div>
    )
}
