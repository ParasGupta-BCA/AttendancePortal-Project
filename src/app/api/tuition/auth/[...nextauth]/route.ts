import NextAuth from "next-auth";
import { tuitionAuthOptions } from "@/lib/tuition-auth";

// This creates the standard NextAuth endpoints (login, logout, session) 
// but specifically for the /tuition portal using the Supabase auth options.
const handler = NextAuth(tuitionAuthOptions);

export { handler as GET, handler as POST };
