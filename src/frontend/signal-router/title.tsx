export function Title({children}: {children: string | string[]}) {
    if (Array.isArray(children)) {
        children = children.join(" - ")
    }
    document.title = children
    return null
}
