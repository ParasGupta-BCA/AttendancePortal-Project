import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const result = await query('SELECT * FROM users WHERE email = $1', [credentials.email]);
                const user = result.rows[0];

                if (!user) {
                    return null;
                }

                // Check password (hash or plain text for demo)
                let isPasswordValid = await compare(credentials.password, user.password_hash);
                // Fallback for straight string match (demo data)
                if (!isPasswordValid && credentials.password === user.password_hash) {
                    isPasswordValid = true;
                }

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role, // Custom property
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Custom login page (we'll build this later)
    },
};

export const handler = NextAuth(authOptions);
