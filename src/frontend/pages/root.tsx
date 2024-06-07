import {hello} from "~/api"

export function Root() {
    async function onFetch() {
        const result = await hello()
        if (result.ok) {
            console.log(result.value)
        } else {
            console.error(result.value)
        }
    }
    return <button onClick={onFetch}>Fetch</button>
}
