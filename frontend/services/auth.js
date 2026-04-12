import { apiFetch } from "@/services/api";

export function login(credentials) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}