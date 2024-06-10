import {useComputed, useSignal} from "@preact/signals"
import * as api from "~/api"
import {contentValidator} from "~/models"
import {isLoggedIn} from "~/session"
import {Link} from "~/signal-router/link"
import {Author} from "./author"
import {Markup} from "./markup"
import {Textarea} from "./textarea"
import {Votes} from "./votes"

export interface PostProps extends api.Post {
    onUpvote: () => void
    onDownvote: () => void
    onComment: (comment_id: number, content: string) => void
}

export function Post({
    id,
    author_username,
    author_avatar,
    author_status,
    vote,
    score,
    board,
    content,
    created_at,
    comment_count,
    onUpvote,
    onDownvote,
    onComment: onCommentCallback,
}: PostProps) {
    const loading = useSignal(false)
    const isCommenting = useSignal(false)
    const comment = useSignal("")
    const commentError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (loading.value) return true
        if (contentValidator(comment.value)) return true
        return false
    })
    async function onReply() {
        loading.value = true
        const result = await api.create_comment({post_id: id, content: comment.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (result.value === null) {
            console.error("comment protocol error")
            return
        }
        isCommenting.value = false
        onCommentCallback(result.value, comment.value)
        comment.value = ""
        loading.value = false
    }
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
                <div class="post__footer">
                    <Link class="link link--small post__board" href={`/board/${board}`}>
                        {board}
                    </Link>
                    <span class="post__separator">•</span>
                    <Link class="link link--small post__comments" href={`/post/${id}`}>
                        {comment_count || "no"} comments
                    </Link>
                    {isLoggedIn() && (
                        <>
                            <span class="post__separator">•</span>
                            <a
                                class="link link--small"
                                href="#"
                                onClick={(event) => {
                                    event.preventDefault()
                                    isCommenting.value = !isCommenting.value
                                }}
                            >
                                {isCommenting.value ?
                                    "cancel"
                                : comment_count ?
                                    "add comment"
                                :   "be the first to comment"}
                            </a>
                        </>
                    )}
                </div>
                {isCommenting.value && (
                    <>
                        <Textarea
                            class="post__comment-textarea"
                            label="Comment"
                            help="Enter your comment"
                            value={comment}
                            error={commentError}
                            validator={contentValidator}
                        />
                        <button
                            class="button post__button"
                            disabled={invalid}
                            onClick={onReply}
                        >
                            {loading.value && <div class="spinner spinner--inverted" />}
                            Add Comment
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
