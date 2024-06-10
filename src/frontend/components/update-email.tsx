import {useComputed, useSignal} from "@preact/signals"
import {update_email} from "~/api"
import {Input} from "~/components/input"
import {useRateLimiter} from "~/hooks/rate-limiter"
import {emailValidator, passwordValidator, usernameValidator} from "~/models"
import {navigate} from "~/signal-router/location"

export function UpdateEmail() {
    const lock = useRateLimiter(60)
    const username = useSignal("")
    const usernameError = useSignal<string | undefined>(undefined)
    const password = useSignal("")
    const passwordError = useSignal<string | undefined>(undefined)
    const email = useSignal("")
    const emailError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (lock.value) return true
        if (usernameValidator(username.value)) return true
        if (passwordValidator(password.value)) return true
        if (emailValidator(email.value)) return true
        return false
    })
    async function onResend() {
        lock.value = true
        const result = await update_email({
            username: username.value,
            password: password.value,
            email: email.value,
        })
        if (!result.ok) {
            lock.value = true
            console.error(result.value)
            return
        }
        if (result.value) {
            navigate("/login")
            return
        }
        passwordError.value = "Invalid password."
    }
    return (
        <>
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
                label="Email"
                help="Enter your email."
                value={email}
                error={emailError}
                validator={emailValidator}
            />
            <button class="form__button button" disabled={invalid} onClick={onResend}>
                Resend Verification Email
            </button>
        </>
    )
}
