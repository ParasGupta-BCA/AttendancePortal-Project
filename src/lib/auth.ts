import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import { compare } from 'bcryptjs';
import { headers } from 'next/headers';

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
                    role: user.role,
                    must_change_password: user.must_change_password,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    events: {
        async signIn({ user }) {
            // We use the signIn event to log the history safely after checks pass
            // However, headers() might not be available in events depending on the exact Next.js version/env
            // But usually, it works in server actions/route handlers. 
            // Since this runs on the server, we try to capture info.
            
            try {
               const headersList = await headers();
               const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
               const userAgent = headersList.get('user-agent') || 'Unknown Device';
               
               await query(
                   `INSERT INTO login_history (user_id, device_info, ip_address) VALUES ($1, $2, $3)`,
                   [user.id, userAgent, ip]
               );
            } catch (error) {
                console.error("Failed to log login history:", error);
                // Don't block login if logging fails
            }
        }
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.must_change_password = (user as any).must_change_password;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).must_change_password = token.must_change_password;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Custom login page (we'll build this later)
    },
};

export const handler = NextAuth(authOptions);
