import type {Signal} from "@preact/signals"
import {location} from "./location"
import {Parameter} from "./route"
import {useRouter} from "./router"

function Post({location, slug}: {location: Signal<string>; slug: Signal<string>}) {
    const match = useRouter(location, {
        root: [],
        comment: ["comment", Parameter.INTEGER],
        edit: ["edit"],
    })
    return match({
        root: () => <h1>{slug.value}</h1>,
        comment: (id) => (
            <h1>
                {slug} - Comment {id}
            </h1>
        ),
        edit: () => <h1>{slug} - Edit</h1>,
        default: () => <h1>404 - Not found</h1>,
    })
}

function App() {
    const match = useRouter(location, {
        root: [],
        about: ["about"],
        contact: ["contact"],
        user: ["user", Parameter.INTEGER],
        post: ["post", Parameter.STRING, Parameter.REST],
    })
    return match({
        root: () => <h1>Root</h1>,
        about: () => <h1>About</h1>,
        contact: () => <h1>Contact</h1>,
        user: (id) => <h1>User {id}</h1>,
        post: (slug, rest) => <Post location={rest} slug={slug} />,
        default: () => <h1>404 - Not found</h1>,
    })
}
