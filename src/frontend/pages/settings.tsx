import {useComputed, useSignal} from "@preact/signals"
import {reset_password, update_avatar, update_status} from "~/api"
import {Input} from "~/components/input"
import {UpdateEmail} from "~/components/update-email"
import {useRateLimiter} from "~/hooks/rate-limiter"
import {statusValidator} from "~/models"
import {fetchSession, session} from "~/session"
import {navigate} from "~/signal-router/location"

export function Settings() {
    if (typeof session.value === "string") {
        navigate("/login")
        return <div class="spinner" />
    }
    const changeAvatarLoading = useSignal(false)
    const avatar = useSignal(session.value.avatar)
    const avatarError = useSignal<string | undefined>(undefined)
    async function onAvatarStatus() {
        changeAvatarLoading.value = true
        const result = await update_avatar({avatar: avatar.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        await fetchSession()
        changeAvatarLoading.value = false
    }
    const changeStatusLoading = useSignal(false)
    const status = useSignal(session.value.status)
    const statusError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (changeStatusLoading.value) return true
        if (statusValidator(status.value)) return true
        return false
    })
    async function onChangeStatus() {
        changeStatusLoading.value = true
        const result = await update_status({status: status.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        await fetchSession()
        changeStatusLoading.value = false
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
                <Input
                    label="Change Avatar"
                    help="URL to an image or an emoji prefixed with `emoji:`"
                    value={avatar}
                    error={avatarError}
                    validator={statusValidator}
                />
                <button
                    class="button form__button"
                    disabled={changeAvatarLoading}
                    onClick={onAvatarStatus}
                >
                    {changeAvatarLoading.value && (
                        <div class="spinner spinner--inverted" />
                    )}
                    Change Avatar
                </button>
            </div>
            <div className="form">
                <Input
                    label="Change Status"
                    help="The text which appears below your username. Maximum 128 characters."
                    value={status}
                    error={statusError}
                    validator={statusValidator}
                />
                <button
                    class="button form__button"
                    disabled={invalid}
                    onClick={onChangeStatus}
                >
                    {changeStatusLoading.value && (
                        <div class="spinner spinner--inverted" />
                    )}
                    Change Status
                </button>
            </div>
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
