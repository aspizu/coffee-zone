import {useRouter} from "~/signal-router/router"
import {location} from "~/signal-router/location"
import {Header} from "~/features/header"
import {Footer} from "~/features/footer"
import {Root} from "./pages/root"

import * as route from "~/signal-router/route"

export function App() {
    const match = useRouter(location, {
        root: [],
    })
    console.log("[] matches /: ", route.match([], "/"))
    return (
        <main>
            <Header />
            <pre>{location.value}</pre>
            {match({
                root: () => <Root />,
                default: () => <div>Not found</div>,
            })}
            <Footer />
        </main>
    )
}
