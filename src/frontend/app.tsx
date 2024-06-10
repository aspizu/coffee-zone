import {Footer} from "~/features/footer"
import {Header} from "~/features/header"
import {location} from "~/signal-router/location"
import {useRouter} from "~/signal-router/router"
import {Board} from "./pages/board"
import {Login} from "./pages/login"
import {NotFound} from "./pages/not-found"
import {Post} from "./pages/post"
import {Register} from "./pages/register"
import {ResetPassword} from "./pages/reset-password"
import {Root} from "./pages/root"
import {Settings} from "./pages/settings"
import {Submit} from "./pages/submit"
import {User} from "./pages/user"
import {Verify} from "./pages/verify"
import {VerifyToken} from "./pages/verify-token"
import {Parameter} from "./signal-router/route"
import {Title} from "./signal-router/title"

export function App() {
    const match = useRouter(location, {
        root: [],
        login: ["login"],
        verify: ["verify"],
        verifyToken: ["verify", Parameter.STRING],
        register: ["register"],
        user: ["user", Parameter.STRING],
        settings: ["settings"],
        resetPassword: ["reset-password", Parameter.STRING],
        submit: ["submit"],
        board: ["board", Parameter.STRING],
        post: ["post", Parameter.NUMBER],
    })
    return (
        <main class="app">
            <Header />
            {match({
                root: () => (
                    <>
                        <Title>Coffee Zone - Home</Title>
                        <Root />
                    </>
                ),
                login: () => (
                    <>
                        <Title>Coffee Zone - Login</Title>
                        <Login />
                    </>
                ),
                verify: () => (
                    <>
                        <Title>Coffee Zone - Verify</Title>
                        <Verify />
                    </>
                ),
                verifyToken: (token) => (
                    <>
                        <Title>Coffee Zone - Email Verification Successful</Title>
                        <VerifyToken token={token} />
                    </>
                ),
                register: () => (
                    <>
                        <Title>Coffee Zone - Register</Title>
                        <Register />
                    </>
                ),
                user: (username) => (
                    <>
                        <Title>Coffee Zone - {username.value}</Title>
                        <User username={username} />
                    </>
                ),
                settings: () => (
                    <>
                        <Title>Coffee Zone - Settings</Title>
                        <Settings />
                    </>
                ),
                resetPassword: (token) => (
                    <>
                        <Title>Coffee Zone - Reset Password</Title>
                        <ResetPassword token={token} />
                    </>
                ),
                submit: () => (
                    <>
                        <Title>Coffee Zone - Submit</Title>
                        <Submit />
                    </>
                ),
                board: (board) => (
                    <>
                        <Title>Coffee Zone - {board.value}</Title>
                        <Board board={board} />
                    </>
                ),
                post: (id) => (
                    <>
                        <Title>Coffee Zone - Post</Title>
                        <Post id={id} />
                    </>
                ),
                default: () => (
                    <>
                        <Title>Coffee Zone - Not Found</Title>
                        <NotFound />
                    </>
                ),
            })}
            <Footer />
        </main>
    )
}
