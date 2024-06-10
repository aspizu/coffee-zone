import {signal, useComputed, type Signal} from "@preact/signals"
import {useRef} from "preact/hooks"
import {match, type Route, type RouteSignalParameters} from "./route"

export type Routes = {
    [key: string]: Route
}

export function useRouter<const T extends Routes>(location: Signal<string>, routes: T) {
    let parameterSignals = useRef<Signal<any>[]>([])
    const route = useComputed(() => {
        for (const [key, value] of Object.entries(routes)) {
            const parameters = match(value, location.value)
            if (parameters) {
                if (parameterSignals.current.length >= parameters.length) {
                    for (let i = 0; i < parameters.length; i++) {
                        parameterSignals.current[i].value = parameters[i]
                    }
                    parameterSignals.current.splice(parameters.length)
                } else {
                    parameterSignals.current = []
                    for (let i = 0; i < parameters.length; i++) {
                        parameterSignals.current.push(signal(parameters[i]))
                    }
                }
                return key
            }
        }
    })
    return <R>(
        cases: {
            [K in keyof T]?: (...parameters: RouteSignalParameters<T[K]>) => R
        } & {
            default?: () => R
        },
    ): R | undefined => {
        if (route.value === undefined) {
            return cases.default?.()
        }
        return cases[route.value]?.(...(parameterSignals.current as any))
    }
}
