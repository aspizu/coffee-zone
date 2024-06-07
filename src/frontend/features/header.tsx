import {NavLink} from "~/signal-router/link"

export function Header() {
    return (
        <header>
            <h1>Header</h1>
            <NavLink href="/">Home</NavLink>
        </header>
    )
}
