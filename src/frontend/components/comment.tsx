import {useComputed, useSignal} from "@preact/signals"
import * as api from "~/api"
import {contentValidator} from "~/models"
import {Link} from "~/signal-router/link"
import {Author} from "./author"
import {Markup} from "./markup"
import {Textarea} from "./textarea"
import {Votes} from "./votes"

export interface CommentProps extends api.Comment {
    onUpvote: () => void
    onDownvote: () => void
    onReply: (reply_id: number, content: string) => void
}

export function Comment({
    id,
    author_username,
    author_avatar,
    author_status,
    vote,
    score,
    content,
    created_at,
    reply_count,
    onUpvote,
    onDownvote,
    onReply: onReplyCallback,
}: CommentProps) {
    const isReplying = useSignal(false)
    const reply = useSignal("")
    const replyError = useSignal<string | undefined>(undefined)
    const invalid = useComputed(() => {
        if (contentValidator(reply.value)) return true
        return false
    })
    async function onReply() {
        const result = await api.create_reply({comment_id: id, content: reply.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (result.value === null) {
            console.error("reply protocol error")
            return
        }
        isReplying.value = false
        onReplyCallback(result.value, reply.value)
        reply.value = ""
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
                    <Link
                        class="link link--small post__comments"
                        href={`/comment/${id}`}
                    >
                        {reply_count || "no"} replies
                    </Link>
                    <span class="post__separator">•</span>
                    <a
                        class="link link--small"
                        href="#"
                        onClick={(event) => {
                            event.preventDefault()
                            isReplying.value = !isReplying.value
                        }}
                    >
                        {isReplying.value ? "cancel" : "reply"}
                    </a>
                </div>
                {isReplying.value && (
                    <>
                        <Textarea
                            label="Reply"
                            help="Enter your reply"
                            value={reply}
                            error={replyError}
                            validator={contentValidator}
                        />
                        <button
                            class="button post__button"
                            disabled={invalid}
                            onClick={onReply}
                        >
                            Reply
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
