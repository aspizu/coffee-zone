import {useSignal, useSignalEffect} from "@preact/signals"
import {useRef} from "preact/hooks"

export function useRateLimiter(rate: number) {
    const ref = useRef(0)
    const lock = useSignal(false)
    useSignalEffect(() => {
        if (lock.value) {
            ref.current = rate
            const interval = setInterval(() => {
                ref.current--
                if (ref.current <= 0) {
                    lock.value = false
                    clearInterval(interval)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    })
    return lock
}
