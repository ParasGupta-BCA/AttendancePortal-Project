import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Attendance Portal
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Welcome to the College Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700">
                Login to Portal
              </Button>
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center space-y-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p><strong>Admin:</strong> admin@college.edu / hashed_secret</p>
              <p><strong>Student:</strong> student@college.edu / pass</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 text-center text-xs text-gray-400">
        <p>Deployed on Vercel | Secured by NextAuth | v1.0 Ready</p>
      </div>
    </div>
  );
}
