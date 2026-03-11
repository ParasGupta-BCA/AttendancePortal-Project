import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { tenantQuery } from "@/lib/db-tenant";
import bcrypt from "bcryptjs";

// This is the auth configuration ONLY for the new /tuition portal
// It authenticates strictly against the SUPABASE database

export const tuitionAuthOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Tuition Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "tuition@tuition.com" },
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

                // Check password 
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash) || credentials.password === user.password_hash; // Fallback for seeds

                if (!isPasswordValid) {
                    throw new Error('Incorrect password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role,
                    must_change_password: user.must_change_password,
                    // CRITICAL FOR ISOLATION: Store the institution ID in the session
                    institution_id: user.institution_id 
                };
            }
        })
    ],
    pages: {
        signIn: '/tuition/login', // New dedicated login page
        error: '/tuition/login'
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.must_change_password = (user as any).must_change_password;
                token.institution_id = (user as any).institution_id;
                token.is_tuition_user = true; // Helpful flag for middleware
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).must_change_password = token.must_change_password;
                (session.user as any).institution_id = token.institution_id;
                (session.user as any).is_tuition_user = token.is_tuition_user;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
