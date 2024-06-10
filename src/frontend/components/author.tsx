import {formatDistanceToNow, formatISO} from "date-fns"
import {Link} from "~/signal-router/link"
import {Avatar} from "./avatar"

export interface AuthorProps {
    avatar: string
    username: string
    status: string
    createdAt?: number
    joinedAt?: number
    lastLoginAt?: number
    karma?: number
}

export function Author({
    avatar,
    username,
    status,
    createdAt,
    joinedAt,
    lastLoginAt,
    karma,
}: AuthorProps) {
    return (
        <div class="author">
            <Avatar>{avatar}</Avatar>
            <div class="author__detail">
                <Link class="link author__username" href={`/user/${username}`}>
                    {username}
                </Link>
                <span class="author__status">
                    {status}
                    {karma !== undefined && ` • ${karma} karma`}
                </span>
            </div>
            {createdAt && (
                <time
                    class="author__created-at"
                    datetime={formatISO(createdAt * 1000)}
                    title={formatISO(createdAt * 1000)}
                >
                    {formatDistanceToNow(createdAt * 1000)} ago
                </time>
            )}
            {joinedAt && (
                <time
                    class="author__created-at"
                    datetime={formatISO(joinedAt * 1000)}
                    title={formatISO(joinedAt * 1000)}
                >
                    Joined {formatDistanceToNow(joinedAt * 1000)} ago
                </time>
            )}
            {lastLoginAt && (
                <>
                    <span>•</span>
                    <time
                        class="author__created-at"
                        datetime={formatISO(lastLoginAt * 1000)}
                        title={formatISO(lastLoginAt * 1000)}
                    >
                        Last login {formatDistanceToNow(lastLoginAt * 1000)} ago
                    </time>
                </>
            )}
        </div>
    )
}
