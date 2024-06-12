import {Signal, useSignal, useSignalEffect} from "@preact/signals"
import {formatDistanceToNow, formatISO} from "date-fns"
import * as api from "~/api"
import {Avatar} from "~/components/avatar"
import {Post} from "~/components/post"
import {downvoteScore, upvoteScore} from "~/models"
import {Link} from "~/signal-router/link"
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
            <div class="profile">
                <Avatar size="large">{user.value.avatar}</Avatar>
                <div className="profile__box">
                    <Link class="link link--large" href={`/user/${username.value}`}>
                        {username}
                    </Link>
                    <span class="profile__status">{user.value.status}</span>
                    <time
                        class="profile__status"
                        datetime={formatISO(user.value.created_at * 1000)}
                    >
                        Joined {formatDistanceToNow(user.value.created_at * 1000)} ago
                    </time>
                    <time
                        class="profile__status"
                        datetime={formatISO(user.value.last_login_at * 1000)}
                    >
                        Last seen {formatDistanceToNow(user.value.last_login_at * 1000)}{" "}
                        ago
                    </time>
                </div>
                <div className="separator" />
                <div className="profile__digit">
                    <span className="profile__digit-count">{user.value.karma}</span>
                    <span className="profile__digit-label">KARMA</span>
                </div>
            </div>
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
