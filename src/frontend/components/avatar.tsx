export interface AvatarProps {
    children: string
}

export function Avatar({children}: AvatarProps) {
    return children.startsWith("emoji:") ?
            <div class="avatar-emoji">
                <span class="avatar-emoji__emoji">
                    {children.slice("emoji:".length)}
                </span>
                <span class="avatar-emoji__backdrop">
                    {children.slice("emoji:".length)}
                </span>
            </div>
        :   <img class="avatar-image" src={children} />
}
