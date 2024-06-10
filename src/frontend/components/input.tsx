import {Signal, useComputed, useSignal} from "@preact/signals"
import {EyeNoneIcon, EyeOpenIcon} from "@radix-ui/react-icons"
import {useId} from "preact/hooks"

export interface InputProps {
    label: string
    password?: boolean
    help: string
    value: Signal<string>
    error: Signal<string | undefined>
    validator: (value: string) => string | undefined
}

export function Input({
    label,
    help,
    password = false,
    value,
    error,
    validator,
}: InputProps) {
    const id = useId()
    const isVisible = useSignal(false)
    const type = useComputed(() => (password && !isVisible.value ? "password" : "text"))
    function onInput(event: any) {
        value.value = event.target.value
        if (value.value) {
            error.value = validator(value.value)
        } else {
            error.value = undefined
        }
    }
    function onVisibilityClick() {
        isVisible.value = !isVisible.value
    }
    return (
        <div class="input">
            <label class="input__label" for={id}>
                {label}
            </label>
            <div class="input__box">
                <input
                    class="input__html-input"
                    id={id}
                    type={type}
                    value={value}
                    onInput={onInput}
                />
                {password && (
                    <button class="input__button" onClick={onVisibilityClick}>
                        {isVisible.value ?
                            <EyeOpenIcon />
                        :   <EyeNoneIcon />}
                    </button>
                )}
            </div>
            {error.value ?
                <span class="input__error">{error}</span>
            :   <span class="input__help">{help}</span>}
        </div>
    )
}
