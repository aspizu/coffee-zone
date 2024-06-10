import {Signal, useSignal, useSignalEffect} from "@preact/signals"
import * as api from "~/api"
import {Comment} from "~/components/comment"
import {Post as PostComponent} from "~/components/post"
import {Reply} from "~/components/reply"
import {downvoteScore, upvoteScore} from "~/models"
import {session} from "~/session"
import {NotFound} from "./not-found"

export interface PostProps {
    id: Signal<number>
}

export function Post({id}: PostProps) {
    const post = useSignal<api.GetPostValue | "not-found" | "loading">("loading")
    async function fetchPost() {
        const result = await api.get_post({post_id: id.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = result.value ?? "not-found"
    }
    async function onUpvote() {
        if (typeof post.value === "string") return
        const result = await api.upvote_post({post_id: post.value.post.id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            post: {
                ...post.value.post,
                vote: api.Vote.UPVOTE,
                score: upvoteScore(post.value.post.score, post.value.post.vote),
            },
        }
    }
    async function onDownvote() {
        if (typeof post.value === "string") return
        const result = await api.downvote_post({post_id: post.value.post.id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            post: {
                ...post.value.post,
                vote: api.Vote.DOWNVOTE,
                score: downvoteScore(post.value.post.score, post.value.post.vote),
            },
        }
    }
    async function onCommentUpvote(comment_id: number) {
        if (typeof post.value === "string") return
        const result = await api.upvote_comment({comment_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            comments: post.value.comments.map((comment) => {
                if (comment.id === comment_id) {
                    return {
                        ...comment,
                        vote: api.Vote.UPVOTE,
                        score: upvoteScore(comment.score, comment.vote),
                    }
                }
                return comment
            }),
        }
    }
    async function onCommentDownvote(comment_id: number) {
        if (typeof post.value === "string") return
        const result = await api.downvote_comment({comment_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            comments: post.value.comments.map((comment) => {
                if (comment.id === comment_id) {
                    return {
                        ...comment,
                        vote: api.Vote.DOWNVOTE,
                        score: downvoteScore(comment.score, comment.vote),
                    }
                }
                return comment
            }),
        }
    }
    async function onReplyUpvote(comment_id: number, reply_id: number) {
        if (typeof post.value === "string") return
        const result = await api.upvote_reply({reply_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            comments: post.value.comments.map((comment) => {
                if (comment.id === comment_id) {
                    return {
                        ...comment,
                        replies: comment.replies.map((reply) => {
                            if (reply.id === reply_id) {
                                return {
                                    ...reply,
                                    vote: api.Vote.UPVOTE,
                                    score: upvoteScore(reply.score, reply.vote),
                                }
                            }
                            return reply
                        }),
                    }
                }
                return comment
            }),
        }
    }
    async function onReplyDownvote(comment_id: number, reply_id: number) {
        if (typeof post.value === "string") return
        const result = await api.downvote_reply({reply_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        post.value = {
            ...post.value,
            comments: post.value.comments.map((comment) => {
                if (comment.id === comment_id) {
                    return {
                        ...comment,
                        replies: comment.replies.map((reply) => {
                            if (reply.id === reply_id) {
                                return {
                                    ...reply,
                                    vote: api.Vote.DOWNVOTE,
                                    score: downvoteScore(reply.score, reply.vote),
                                }
                            }
                            return reply
                        }),
                    }
                }
                return comment
            }),
        }
    }
    function onReply(comment_id: number, reply_id: number, content: string) {
        if (typeof session.value === "string") return
        if (typeof post.value === "string") return
        const comment_idx = post.value.comments.findIndex(
            (comment) => comment.id === comment_id,
        )
        if (comment_idx === -1) return
        post.value.comments[comment_idx].replies.unshift({
            id: reply_id,
            author_username: session.value.username,
            author_avatar: session.value.avatar,
            author_status: session.value.status,
            vote: api.Vote.NONE,
            score: 0,
            content,
            created_at: 0, // TODO: get current time
        })
        post.value = {...post.value}
    }
    useSignalEffect(() => {
        fetchPost()
    })
    if (post.value === "not-found") {
        return <NotFound />
    }
    if (post.value === "loading") {
        return <div class="spinner" />
    }
    return (
        <>
            <PostComponent
                {...post.value.post}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
                onComment={fetchPost}
            />
            <div className="feed comments">
                {post.value.comments.map((comment) => (
                    <>
                        <Comment
                            key={comment.id}
                            {...comment}
                            onUpvote={() => onCommentUpvote(comment.id)}
                            onDownvote={() => onCommentDownvote(comment.id)}
                            onReply={(reply_id, content) =>
                                onReply(comment.id, reply_id, content)
                            }
                        />
                        <div class="feed feed--naked replies">
                            {comment.replies.map((reply) => (
                                <Reply
                                    key={reply.id}
                                    {...reply}
                                    onUpvote={() => onReplyUpvote(comment.id, reply.id)}
                                    onDownvote={() =>
                                        onReplyDownvote(comment.id, reply.id)
                                    }
                                />
                            ))}
                        </div>
                    </>
                ))}
            </div>
        </>
    )
}
