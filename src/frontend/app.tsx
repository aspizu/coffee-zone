import {useRouter} from "~/signal-router/router"
import {location} from "~/signal-router/location"
import {Header} from "~/features/header"
import {Footer} from "~/features/footer"
import {Root} from "./pages/root"

export function App() {
    const match = useRouter(location, {
        root: [],
    })
    return (
        <main>
            <Header />
            {match({
                root: () => <Root />,
            })}
            <Footer />
        </main>
    )
}
