import { api } from "@/lib/api"
import type { AuthResponse, SignInInput, SignUpInput } from "@/types/user"

export const authApi = {
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials)
    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }
    return response
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", credentials)
    if (response.token) {
      localStorage.setItem("auth_token", response.token)
    }
    return response
  },

  signOut: async (): Promise<void> => {
    await api.post("/auth/logout", {})
    localStorage.removeItem("auth_token")
  },

  resetPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email })
  },
}
