import {Vote} from "./api"

export function usernameValidator(username: string) {
    if (username.length < 3) {
        return "Username is too short."
    }
    if (username.length > 64) {
        return "Username is too long."
    }
    if (username.trim() !== username) {
        return "Username contains whitespace."
    }
    if (!/^[a-z]+$/.test(username)) {
        return "Username must only contain lowercase alphabets."
    }
}

const COMMON_PASSWORDS = [
    "passphrase",
    "password",
    "12345678",
    "password1",
    "password123",
    "password1234",
    "password12345",
]

export function passwordValidator(password: string) {
    if (password.length < 8) {
        return "Password is too short."
    }
    if (password.trim() !== password) {
        return "Password contains whitespace."
    }
    if (COMMON_PASSWORDS.includes(password)) {
        return "Password is too common."
    }
}

export function emailValidator(email: string) {
    if (email.trim() !== email) {
        return "Email contains whitespace."
    }
    if (!email.includes("@")) {
        return "Email is invalid."
    }
}

export function boardValidator(board: string) {
    if (board.length < 3) {
        return "Board is too short."
    }
    if (board.length > 64) {
        return "Board is too long."
    }
    if (board.trim() !== board) {
        return "Board contains whitespace."
    }
    if (!/^[a-z]+$/.test(board)) {
        return "Board must only contain lowercase alphabets."
    }
}

export function contentValidator(content: string) {
    if (content.length < 3) {
        return "Content is too short."
    }
    if (content.length > 4096) {
        return "Content is too long."
    }
}

export function statusValidator(status: string) {
    if (status.length > 128) {
        return "Status is too long."
    }
}

export function upvoteScore(score: number, vote: Vote) {
    switch (vote) {
        case Vote.UPVOTE:
            return score
        case Vote.DOWNVOTE:
            return score + 2
        default:
            return score + 1
    }
}

export function downvoteScore(score: number, vote: Vote) {
    switch (vote) {
        case Vote.DOWNVOTE:
            return score
        case Vote.UPVOTE:
            return score - 2
        default:
            return score - 1
    }
}
