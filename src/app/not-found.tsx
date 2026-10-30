import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md space-y-3 p-8 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link href="/" className="btn-secondary">
        Back to the store
      </Link>
    </div>
  );
}
