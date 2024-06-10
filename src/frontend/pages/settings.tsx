import {reset_password} from "~/api"
import {UpdateEmail} from "~/components/update-email"
import {useRateLimiter} from "~/hooks/rate-limiter"
import {isLoggedOut, session} from "~/session"
import {navigate} from "~/signal-router/location"

export function Settings() {
    if (isLoggedOut()) {
        navigate("/login")
    }
    const lock = useRateLimiter(60)
    async function onResetPassword() {
        if (typeof session.value === "string") return
        lock.value = true
        const result = await reset_password({
            username: session.value.username,
            email: session.value.email,
        })
        if (!result.ok) {
            console.error(result.value)
            return
        }
    }
    return (
        <>
            <div class="form">
                <div class="form__section">
                    <span class="bold">Change password</span>
                    <span>
                        A password reset email will be sent to your email. Click the
                        link in the email to reset your password.
                    </span>
                </div>
                <button
                    class="button form__button"
                    disabled={lock}
                    onClick={onResetPassword}
                >
                    Reset Password
                </button>
            </div>
            <div class="form">
                <div class="form__section">
                    <span class="bold">Change email address</span>
                    <span>
                        A verification email will be sent to your new email. Click the
                        link in the email to verify your new email.
                    </span>
                </div>
                <UpdateEmail />
            </div>
        </>
    )
}
