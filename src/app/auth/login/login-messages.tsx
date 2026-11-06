"use client";

export function LoginMessages({ error, reset }: { error?: string; reset?: string }) {
  return (
    <>
      {reset === "success" ? (
        <p className="mt-2 text-sm text-emerald-700" role="status">
          Password updated. You can sign in now.
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-rose-700" role="alert">
          Could not sign in. Check your email and password.
        </p>
      ) : null}
    </>
  );
}
