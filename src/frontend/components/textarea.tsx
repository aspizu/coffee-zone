import {Signal} from "@preact/signals"
import {useId} from "preact/hooks"

export interface TextareaProps {
    class?: string
    label: string
    help: string
    value: Signal<string>
    error: Signal<string | undefined>
    validator: (value: string) => string | undefined
}

export function Textarea({
    class: className,
    label,
    help,
    value,
    error,
    validator,
}: TextareaProps) {
    const id = useId()
    const lineCount = value.value.split("\n").length
    function onInput(event: any) {
        value.value = event.target.value
        if (value.value) {
            error.value = validator(value.value)
        } else {
            error.value = undefined
        }
    }
    return (
        <div class={`${className} input`}>
            <label for={id} class="input__label">
                {label}
            </label>
            <textarea
                id={id}
                class="textarea"
                style={{"--lines": lineCount}}
                value={value}
                onInput={onInput}
            />
            {error.value ?
                <span class="input__error">{error}</span>
            :   <span class="input__help">{help}</span>}
        </div>
    )
}
