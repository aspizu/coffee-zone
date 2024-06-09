import {Footer} from "~/features/footer"
import {Header} from "~/features/header"
import {location} from "~/signal-router/location"
import {useRouter} from "~/signal-router/router"
import {Login} from "./pages/login"
import {NotFound} from "./pages/not-found"
import {Register} from "./pages/register"
import {Root} from "./pages/root"
import {Settings} from "./pages/settings"
import {User} from "./pages/user"
import {Verify} from "./pages/verify"
import {VerifyToken} from "./pages/verify-token"
import {Parameter} from "./signal-router/route"

export function App() {
    const match = useRouter(location, {
        root: [],
        login: ["login"],
        verify: ["verify"],
        verifyToken: ["verify", Parameter.STRING],
        register: ["register"],
        user: ["user", Parameter.STRING],
        settings: ["settings"],
    })
    return (
        <main class="app">
            <Header />
            {match({
                root: () => <Root />,
                login: () => <Login />,
                verify: () => <Verify />,
                verifyToken: (token) => <VerifyToken token={token} />,
                register: () => <Register />,
                user: (username) => <User username={username} />,
                settings: () => <Settings />,
                default: () => <NotFound />,
            })}
            <Footer />
        </main>
    )
}
