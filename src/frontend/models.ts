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
