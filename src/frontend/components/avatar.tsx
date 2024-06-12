export interface AvatarProps {
    children: string
    size?: "medium" | "large"
}

export function Avatar({size = "medium", children}: AvatarProps) {
    return children.startsWith("emoji:") ?
            <div class={`avatar avatar-emoji avatar--${size}`}>
                <span class="avatar-emoji__emoji">
                    {children.slice("emoji:".length)}
                </span>
                <span class="avatar-emoji__backdrop">
                    {children.slice("emoji:".length)}
                </span>
            </div>
        :   <img class={`avatar avatar-image avatar--${size}`} src={children} />
}
