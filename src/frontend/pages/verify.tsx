import {UpdateEmail} from "~/components/update-email"
import {isLoggedIn} from "~/session"
import {navigate} from "~/signal-router/location"

export function Verify() {
    if (isLoggedIn()) {
        navigate("/")
    }
    return (
        <div class="form">
            <span class="bold">A verification email was sent to your email.</span>
            <span>
                Did not receive the email? Enter your email below to resend the
                verification email.
            </span>
            <UpdateEmail />
        </div>
    )
}
