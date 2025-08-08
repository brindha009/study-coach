import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        // For demo purposes, accept any email
        if (credentials?.email) {
          return {
            id: "demo-user",
            email: credentials.email,
            name: "Demo Student",
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token) {
        session.user.id = token.sub || "demo-user"
      }
      return session
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
