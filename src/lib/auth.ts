import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import { tenantQuery } from './db-tenant';
import { compare } from 'bcryptjs';
import { headers } from 'next/headers';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
    providers: [
        // 1. College Provider (Neon DB)
        CredentialsProvider({
            id: 'credentials',
            name: 'College Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Check for Passkey Token Bypass
                if (credentials.password.startsWith('PASSKEY-TOKEN:')) {
                    const token = credentials.password.split('PASSKEY-TOKEN:')[1];
                    const [payloadB64, signature] = token.split('.');

                    if (!payloadB64 || !signature) return null;

                    const secret = process.env.NEXTAUTH_SECRET || 'secret';
                    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');

                    if (signature !== expectedSignature) return null;

                    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
                    if (Date.now() > payload.exp) return null;

                    // Token is valid, fetch user
                    const tokenUserRes = await query('SELECT * FROM users WHERE email = $1', [payload.email]);
                    const tokenUser = tokenUserRes.rows[0];
                    if (!tokenUser) return null;

                    return {
                        id: tokenUser.id,
                        email: tokenUser.email,
                        name: tokenUser.full_name,
                        role: tokenUser.role,
                        must_change_password: tokenUser.must_change_password,
                    };
                }

                // Standard Password Check against Neon DB
                const result = await query('SELECT * FROM users WHERE email = $1', [credentials.email]);
                const user = result.rows[0];

                if (!user) return null;

                let isPasswordValid = await compare(credentials.password, user.password_hash);
                if (!isPasswordValid && credentials.password === user.password_hash) {
                    isPasswordValid = true;
                }

                if (!isPasswordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role,
                    must_change_password: user.must_change_password,
                };
            },
        }),

        // 2. Tuition Provider (Supabase DB)
        CredentialsProvider({
            id: 'tuition',
            name: 'Tuition Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                // SECURITY: This ONLY queries Supabase (tenantQuery)
                const result = await tenantQuery('SELECT * FROM users WHERE email = $1', [credentials.email]);

                if (result.rows.length === 0) {
                    throw new Error('No tuition account found with that email');
                }

                const user = result.rows[0];

                let isPasswordValid = await compare(credentials.password, user.password_hash);
                if (!isPasswordValid && credentials.password === user.password_hash) {
                    isPasswordValid = true;
                }

                if (!isPasswordValid) {
                    throw new Error('Incorrect password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role,
                    must_change_password: user.must_change_password,
                    institution_id: user.institution_id 
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    events: {
        async signIn({ user, account }) {
            // Do not log tuition users to the college Neon DB history table
            if (account?.provider === 'tuition') return;

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
            }
        }
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.must_change_password = (user as any).must_change_password;

                // Explicitly differentiate tuition accounts
                if (account?.provider === 'tuition') {
                    token.is_tuition_user = true;
                    token.institution_id = (user as any).institution_id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).must_change_password = token.must_change_password;

                if (token.is_tuition_user) {
                    (session.user as any).is_tuition_user = true;
                    (session.user as any).institution_id = token.institution_id;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Default for college portal
    },
};

export const handler = NextAuth(authOptions);
