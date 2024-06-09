import {Signal, useSignalEffect} from "@preact/signals"
import {verify} from "~/api"

export function VerifyToken({token}: {token: Signal<string>}) {
    async function onVerify(verification_token: string) {
        const result = await verify({verification_token})
        if (!result.ok) {
            console.error(result.value)
            return
        }
    }
    useSignalEffect(() => {
        onVerify(token.value)
    })
    return <span class="bold">Your account is verified successfully.</span>
}
