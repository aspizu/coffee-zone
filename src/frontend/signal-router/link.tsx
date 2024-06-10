import {type ComponentPropsWithRef} from "preact/compat"
import {location, navigate} from "./location"
import {valueof} from "./misc"

export interface LinkProps extends ComponentPropsWithRef<"a"> {
    setAriaCurrent?: boolean
    setCurrentParent?: boolean
}

export function Link({
    setAriaCurrent = false,
    setCurrentParent = false,
    ...props
}: LinkProps) {
    const href = valueof(props.href)
    if (href && (setAriaCurrent || setCurrentParent)) {
        const loc = new URL(location.value)
        const url = new URL(href, window.location.origin)
        if (setAriaCurrent && url.pathname === loc.pathname) {
            props["aria-current"] = "page"
        }
        if (setCurrentParent && window.location.pathname.startsWith(url.pathname)) {
            /* @ts-ignore */
            props["data-current-parent"] = ""
        }
    }
    return (
        <a
            {...props}
            onClick={(event) => {
                if (!href) return
                event.preventDefault()
                navigate(href)
            }}
        />
    )
}

export function NavLink({setAriaCurrent = true, ...props}: LinkProps) {
    return <Link setAriaCurrent={setAriaCurrent} {...props} />
}

export function DirLink({
    setAriaCurrent = true,
    setCurrentParent = true,
    ...props
}: LinkProps) {
    return (
        <Link
            setAriaCurrent={setAriaCurrent}
            setCurrentParent={setCurrentParent}
            {...props}
        />
    )
}
