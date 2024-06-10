import {formatDistanceToNow, formatISO} from "date-fns"
import {Link} from "~/signal-router/link"
import {Avatar} from "./avatar"

export interface AuthorProps {
    avatar: string
    username: string
    status: string
    createdAt: number
}

export function Author({avatar, username, status, createdAt}: AuthorProps) {
    return (
        <div class="author">
            <Avatar>{avatar}</Avatar>
            <div class="author__detail">
                <Link class="link author__username" href={`/user/${username}`}>
                    {username}
                </Link>
                <span class="author__status">{status}</span>
            </div>
            <time
                class="author__created-at"
                datetime={formatISO(createdAt * 1000)}
                title={formatISO(createdAt * 1000)}
            >
                {formatDistanceToNow(createdAt * 1000)} ago
            </time>
        </div>
    )
}
