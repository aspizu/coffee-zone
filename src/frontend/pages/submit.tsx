import {useComputed, useSignal} from "@preact/signals"
import {create_post} from "~/api"
import {Input} from "~/components/input"
import {Textarea} from "~/components/textarea"
import {boardValidator, contentValidator} from "~/models"
import {isLoggedOut} from "~/session"
import {navigate} from "~/signal-router/location"

export function Submit() {
    if (isLoggedOut()) {
        navigate("/login")
    }
    const board = useSignal("")
    const boardError = useSignal<string | undefined>(undefined)
    const content = useSignal("")
    const contentError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (boardValidator(board.value)) return true
        if (contentValidator(content.value)) return true
        return false
    })
    async function onSubmit() {
        const result = await create_post({board: board.value, content: content.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (result.value === null) {
            boardError.value = "Board does not exist."
            return
        }
        navigate(`/post/${result.value}`)
    }
    return (
        <div class="form">
            <Input
                label="Board"
                help="Name of the board without any slashes."
                value={board}
                error={boardError}
                validator={boardValidator}
            />
            <Textarea
                label="Content"
                help="You can use Markdown."
                value={content}
                error={contentError}
                validator={contentValidator}
            />
            <button class="button form__button" disabled={invalid} onClick={onSubmit}>
                Submit
            </button>
        </div>
    )
}
