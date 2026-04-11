import Link from "next/link";
import { logoutAction } from "../../lib/logout-action";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-gray-900">Dashboard</h1>
          <p className="mt-1 text-body text-gray-600">
            You are signed in. This area is protected by middleware.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-border-default px-4 py-2 text-body font-medium text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </form>
      </header>
      <p className="text-body text-gray-600">
        <Link href="/" className="font-medium text-primary-600 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
