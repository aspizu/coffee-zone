import {ChevronDownIcon, ChevronUpIcon} from "@radix-ui/react-icons"
import {Vote} from "~/api"
import {isLoggedIn} from "~/session"

export interface VotesProps {
    vote: Vote
    score: number
    onUpvote: () => void
    onDownvote: () => void
}

export function Votes({vote, score, onUpvote, onDownvote}: VotesProps) {
    return (
        <div class="votes">
            <button
                class={`votes__button votes__button--upvote ${
                    vote === Vote.UPVOTE && "votes__button--active"
                }`}
                disabled={!isLoggedIn()}
                onClick={() => {
                    if (vote !== Vote.UPVOTE) onUpvote()
                }}
            >
                <ChevronUpIcon />
            </button>
            <span class="votes__score">{score}</span>
            <button
                class={`votes__button votes__button--downvote ${
                    vote === Vote.DOWNVOTE && "votes__button--active"
                }`}
                disabled={!isLoggedIn()}
                onClick={() => {
                    if (vote !== Vote.DOWNVOTE) onDownvote()
                }}
            >
                <ChevronDownIcon />
            </button>
        </div>
    )
}
