export interface AvatarProps {
    children: string
}

export function Avatar({children}: AvatarProps) {
    return children.startsWith("emoji:") ?
            <span class="avatar-emoji">{children.slice("emoji:".length)}</span>
        :   <img class="avatar-image" src={children} />
}
