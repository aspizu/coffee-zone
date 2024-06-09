import {session} from "~/session"
import {NavLink} from "~/signal-router/link"

export function Header() {
    return (
        <header class="header">
            <NavLink href="/">home</NavLink>
            {session.value ?
                <>
                    <NavLink href={`/${session.value.username}`}>profile</NavLink>
                    <NavLink href="/settings">settings</NavLink>
                </>
            :   <>
                    <NavLink href="/login">login</NavLink>
                    <NavLink href="/register">register</NavLink>
                </>
            }
        </header>
    )
}
