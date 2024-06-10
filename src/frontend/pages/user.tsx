import {Signal, useSignal, useSignalEffect} from "@preact/signals"
import * as api from "~/api"
import {Author} from "~/components/author"
import {Post} from "~/components/post"
import {downvoteScore, upvoteScore} from "~/models"
import {navigate} from "~/signal-router/location"
import {NotFound} from "./not-found"

export interface UserProps {
    username: Signal<string>
}

export function User({username}: UserProps) {
    const user = useSignal<api.User | "not-found" | "loading">("loading")
    async function fetchUser() {
        const result = await api.get_user({username: username.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        user.value = result.value ?? "not-found"
    }
    async function onUpvote(post_id: number) {
        const result = await api.upvote_post({post_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (user.value === "loading" || user.value === "not-found") return
        user.value = {
            ...user.value,
            posts: user.value.posts.map((post) =>
                post.id === post_id ?
                    {
                        ...post,
                        vote: api.Vote.UPVOTE,
                        score: upvoteScore(post.score, post.vote),
                    }
                :   post,
            ),
        }
    }
    async function onDownvote(post_id: number) {
        const result = await api.downvote_post({post_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (user.value === "loading" || user.value === "not-found") return
        user.value = {
            ...user.value,
            posts: user.value.posts.map((post) =>
                post.id === post_id ?
                    {
                        ...post,
                        vote: api.Vote.DOWNVOTE,
                        score: downvoteScore(post.score, post.vote),
                    }
                :   post,
            ),
        }
    }
    useSignalEffect(() => {
        fetchUser()
    })
    if (user.value === "loading") {
        return <div class="spinner" />
    }
    if (user.value === "not-found") {
        return <NotFound />
    }
    return (
        <>
            <Author
                avatar={user.value.avatar}
                username={username.value}
                status={user.value.status}
                joinedAt={user.value.created_at}
                lastLoginAt={user.value.last_login_at}
                karma={user.value.karma}
            />
            <div className="feed">
                {user.value.posts.map((post) => (
                    <Post
                        key={post.id}
                        {...post}
                        onUpvote={() => onUpvote(post.id)}
                        onDownvote={() => onDownvote(post.id)}
                        onComment={() => {
                            navigate(`/post/${post.id}`)
                        }}
                    />
                ))}
            </div>
        </>
    )
}
