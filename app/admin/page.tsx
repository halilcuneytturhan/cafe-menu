import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    // =========================
    // COUNTS
    // =========================

    const { count: productCount } = await supabase
        .from("products")
        .select("*", {
            count: "exact",
            head: true,
        });

    const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", {
            count: "exact",
            head: true,
        });

    // =========================
    // CATEGORIES
    // =========================

    const {
        data: categories,
        error: categoriesError,
    } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", {
            ascending: true,
        });

    if (categoriesError) {
        console.error(
            "Categories error:",
            categoriesError
        );
    }

    // =========================
    // PRODUCTS
    // =========================

    const {
        data: products,
        error: productsError,
    } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", {
            ascending: true,
        });

    if (productsError) {
        console.error(
            "Products error:",
            productsError
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f0ea] text-[#292622]">

            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <header className="border-b border-[#e3dbd2] bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">

                    <div>
                        <p className="text-lg font-semibold">
                            Butik Cafe
                        </p>

                        <p className="text-xs text-[#81766e]">
                            Yönetim Paneli
                        </p>
                    </div>

                    <form
                        action="/api/admin/logout"
                        method="post"
                    >
                        <button
                            type="submit"
                            className="rounded-xl border border-[#ddd4cb] px-4 py-2 text-sm font-medium transition hover:bg-[#f4f0ea]"
                        >
                            Çıkış Yap
                        </button>
                    </form>

                </div>
            </header>

            {/* ========================= */}
            {/* DASHBOARD */}
            {/* ========================= */}

            <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

                <div className="mb-8">
                    <p className="text-sm text-[#81766e]">
                        Hoş geldiniz
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold">
                        Menü Yönetimi
                    </h1>

                    <p className="mt-2 text-sm text-[#81766e]">
                        Kategorileri ve ürünleri sürükleyerek
                        menü sırasını değiştirebilirsiniz.
                    </p>
                </div>

                {/* ========================= */}
                {/* STATISTICS */}
                {/* ========================= */}

                <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-[#e3dbd2] bg-white p-6 shadow-sm">
                        <p className="text-sm text-[#81766e]">
                            Toplam Kategori
                        </p>

                        <p className="mt-2 text-3xl font-semibold">
                            {categoryCount ?? 0}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#e3dbd2] bg-white p-6 shadow-sm">
                        <p className="text-sm text-[#81766e]">
                            Toplam Ürün
                        </p>

                        <p className="mt-2 text-3xl font-semibold">
                            {productCount ?? 0}
                        </p>
                    </div>

                </div>

                {/* ========================= */}
                {/* CATEGORIES */}
                {/* ========================= */}

                <div className="mt-8">
                    <CategoryManager
                        initialCategories={
                            categories ?? []
                        }
                    />
                </div>

                {/* ========================= */}
                {/* PRODUCTS */}
                {/* ========================= */}

                <div className="mt-10">
                    <ProductManager
                        initialProducts={
                            products ?? []
                        }
                        categories={
                            categories ?? []
                        }
                    />
                </div>

            </section>

        </main>
    );
}