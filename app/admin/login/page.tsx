"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const supabase = createClient();

        const { error: loginError } =
            await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

        if (loginError) {
            setError("E-posta veya şifre hatalı.");
            setLoading(false);
            return;
        }

        const verifyResponse = await fetch(
            "/api/admin/verify",
            {
                method: "POST",
                cache: "no-store",
            }
        );

        if (!verifyResponse.ok) {
            await supabase.auth.signOut();

            setError(
                verifyResponse.status === 403
                    ? "Bu hesap yönetim paneline yetkili değil."
                    : "Yönetici yetkisi doğrulanamadı."
            );

            setLoading(false);
            return;
        }

        window.location.href = "/admin";
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f4f0ea] px-6">
            <div className="w-full max-w-md rounded-3xl border border-[#e3dbd2] bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#292622] text-lg font-semibold text-white">
                        K
                    </div>

                    <h1 className="text-2xl font-semibold text-[#292622]">
                        Kozalak Cafe
                    </h1>

                    <p className="mt-2 text-sm text-[#81766e]">
                        Yönetim Paneli
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#292622]">
                            E-posta
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz"
                            required
                            autoComplete="email"
                            className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] placeholder:text-[#81766e] outline-none transition focus:border-[#292622]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#292622]">
                            Şifre
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifreniz"
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] placeholder:text-[#81766e] outline-none transition focus:border-[#292622]"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3631] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
            </div>
        </main>
    );
}
