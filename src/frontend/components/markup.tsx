import {Link} from "~/signal-router/link"

export interface MarkupProps {
    children: string
}

export function Markup({children}: MarkupProps) {
    const components: any[] = []
    let part = ""
    let key = ""
    let link = false
    for (let i = 0; i < children.length; i++) {
        part += children[i]
        if (children[i] === " ") {
            if (link) {
                components.push(
                    <Link class="link" href={key}>
                        {key}
                    </Link>,
                )
                components.push(" ")
                link = false
                part = ""
            }
            key = ""
        } else {
            key += children[i]
        }
        if (key === "https://") {
            components.push(part.slice(0, -"https://".length))
            link = true
        }
    }
    if (link) {
        components.push(
            <Link class="link" href={key}>
                {key}
            </Link>,
        )
        components.push(" ")
        link = false
        part = ""
    }
    components.push(part)
    return <>{components}</>
}
