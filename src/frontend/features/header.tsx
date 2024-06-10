import {logout} from "~/api"
import coffeeZonePng from "~/assets/coffee-zone.png"
import {fetchSession, session} from "~/session"
import {NavLink} from "~/signal-router/link"
import {navigate} from "~/signal-router/location"

export function Header() {
    async function onLogOut(event: Event) {
        event.preventDefault()
        const result = await logout()
        if (!result.ok) {
            console.error(result.value)
            return
        }
        await fetchSession()
        navigate("/login")
    }
    return (
        <header class="header">
            <img class="header__logo" src={coffeeZonePng} alt="Coffee Zone" />
            <NavLink class="link header__link" href="/">
                home
            </NavLink>
            {typeof session.value !== "string" ?
                <>
                    <NavLink class="link header__link" href="/submit">
                        submit
                    </NavLink>
                    <NavLink
                        class="link header__link"
                        href={`/user/${session.value.username}`}
                    >
                        profile
                    </NavLink>
                    <NavLink class="link header__link" href="/settings">
                        settings
                    </NavLink>
                    <a class="link header__link" href="#" onClick={onLogOut}>
                        log out
                    </a>
                </>
            :   <>
                    <NavLink class="link header__link" href="/login">
                        login
                    </NavLink>
                    <NavLink class="link header__link" href="/register">
                        register
                    </NavLink>
                </>
            }
        </header>
    )
}
