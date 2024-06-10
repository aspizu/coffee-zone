import {Signal, useSignal, useSignalEffect} from "@preact/signals"
import * as api from "~/api"
import {Post} from "~/components/post"
import {downvoteScore, upvoteScore} from "~/models"
import {navigate} from "~/signal-router/location"
import {NotFound} from "./not-found"

export interface BoardProps {
    board: Signal<string>
}

export function Board({board}: BoardProps) {
    const posts = useSignal<api.Post[] | "loading">("loading")
    async function fetchPosts() {
        const result = await api.get_board_feed({board: board.value})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        posts.value = result.value
    }
    async function onUpvote(post_id: number) {
        const result = await api.upvote_post({post_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (posts.value === "loading") return
        posts.value = posts.value.map((post) =>
            post.id === post_id ?
                {
                    ...post,
                    vote: api.Vote.UPVOTE,
                    score: upvoteScore(post.score, post.vote),
                }
            :   post,
        )
    }
    async function onDownvote(post_id: number) {
        const result = await api.downvote_post({post_id})
        if (!result.ok) {
            console.error(result.value)
            return
        }
        if (posts.value === "loading") return
        posts.value = posts.value.map((post) =>
            post.id === post_id ?
                {
                    ...post,
                    vote: api.Vote.DOWNVOTE,
                    score: downvoteScore(post.score, post.vote),
                }
            :   post,
        )
    }
    useSignalEffect(() => {
        fetchPosts()
    })
    if (Array.isArray(posts.value) && posts.value.length === 0) {
        return <NotFound />
    }
    return (
        <div class="feed">
            {posts.value === "loading" ?
                <div class="spinner" />
            :   posts.value.map((post) => (
                    <Post
                        key={post.id}
                        {...post}
                        onUpvote={() => onUpvote(post.id)}
                        onDownvote={() => onDownvote(post.id)}
                        onComment={() => {
                            navigate(`/post/${post.id}`)
                        }}
                    />
                ))
            }
        </div>
    )
}
