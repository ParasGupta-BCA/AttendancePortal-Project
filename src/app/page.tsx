import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Attendance Portal</h1>
        <Link href="/login" className="text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
