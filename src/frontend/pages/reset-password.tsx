import {Signal, useComputed, useSignal} from "@preact/signals"
import {update_password} from "~/api"
import {Input} from "~/components/input"
import {passwordValidator} from "~/models"
import {fetchSession} from "~/session"
import {navigate} from "~/signal-router/location"

export function ResetPassword({token}: {token: Signal<string>}) {
    const password = useSignal("")
    const passwordError = useSignal<string | undefined>(undefined)
    const passwordConfirmation = useSignal("")
    const passwordConfirmationError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (passwordValidator(password.value)) return true
        if (passwordConfirmationValidator(passwordConfirmation.value)) return true
        return false
    })
    function passwordConfirmationValidator(passwordConfirmation: string) {
        if (password.value !== passwordConfirmation) {
            return "Passwords do not match."
        }
    }
    async function onResetPassword() {
        const result = await update_password({
            reset_token: token.value,
            password: password.value,
        })
        if (!result.ok) {
            console.error(result.value)
            return
        }
        await fetchSession()
        navigate("/login")
    }
    return (
        <div class="form">
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
            <button
                class="button form__button"
                disabled={invalid}
                onClick={onResetPassword}
            >
                Reset Password
            </button>
        </div>
    )
}
