import * as api from "~/api"
import {Author} from "./author"
import {Markup} from "./markup"
import {Votes} from "./votes"

export interface ReplyProps extends api.Reply {
    onUpvote: () => void
    onDownvote: () => void
}

export function Reply({
    author_username,
    author_avatar,
    author_status,
    vote,
    score,
    content,
    created_at,
    onUpvote,
    onDownvote,
}: ReplyProps) {
    return (
        <div class="post">
            <Votes
                vote={vote}
                score={score}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
            />
            <div class="post__right">
                <Author
                    avatar={author_avatar}
                    username={author_username}
                    status={author_status}
                    createdAt={created_at}
                />
                <span class="post__content">
                    <Markup>{content}</Markup>
                </span>
            </div>
        </div>
    )
}
