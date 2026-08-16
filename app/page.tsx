import { createClient } from "@/lib/supabase/server";

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  sort_order: number;
  is_active: boolean;
}

export default async function HomePage() {
  const supabase = await createClient();

  // =========================
  // CATEGORIES
  // =========================

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      });

  // =========================
  // PRODUCTS
  // =========================

  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      });

  // =========================
  // ERRORS
  // =========================

  if (categoriesError) {
    console.error(
      "Categories error:",
      categoriesError
    );
  }

  if (productsError) {
    console.error(
      "Products error:",
      productsError
    );
  }

  // =========================
  // DATA
  // =========================

  const activeCategories: Category[] =
    categories ?? [];

  const activeProducts: Product[] =
    products ?? [];

  return (
    <main className="min-h-screen bg-[#f4f0ea] text-[#292622]">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <header className="border-b border-[#e3dbd2] bg-white">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center sm:py-10">

          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#81766e]">
            Butik Cafe
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Menü
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#81766e]">
            Kahve, tatlı ve lezzetli seçeneklerimizi
            keşfedin.
          </p>

        </div>
      </header>

      {/* ========================= */}
      {/* CATEGORY NAVIGATION */}
      {/* ========================= */}

      {activeCategories.length > 0 && (
        <nav className="sticky top-0 z-40 border-b border-[#e3dbd2] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-3xl">

            <div className="overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">

              <div className="flex min-w-max items-center gap-2 py-3">

                {activeCategories.map(
                  (category) => (
                    <a
                      key={category.id}
                      href={`#${category.slug}`}
                      className="
                        rounded-full
                        border
                        border-[#ddd4cb]
                        bg-[#f8f5f1]
                        px-4
                        py-2
                        text-sm
                        font-medium
                        whitespace-nowrap
                        text-[#5f5750]
                        transition
                        hover:border-[#292622]
                        hover:bg-[#292622]
                        hover:text-white
                        active:scale-[0.98]
                      "
                    >
                      {category.name}
                    </a>
                  )
                )}

              </div>

            </div>

          </div>
        </nav>
      )}

      {/* ========================= */}
      {/* MENU */}
      {/* ========================= */}

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {activeCategories.length === 0 ? (

          <div className="rounded-2xl border border-[#e3dbd2] bg-white p-8 text-center shadow-sm">

            <p className="text-sm text-[#81766e]">
              Menüde henüz kategori bulunmuyor.
            </p>

          </div>

        ) : (

          <div className="space-y-12">

            {activeCategories.map(
              (category) => {

                const categoryProducts =
                  activeProducts.filter(
                    (product) =>
                      product.category_id ===
                      category.id
                  );

                return (
                  <section
                    key={category.id}
                    id={category.slug}
                    className="scroll-mt-20"
                  >

                    {/* ========================= */}
                    {/* CATEGORY TITLE */}
                    {/* ========================= */}

                    <div className="mb-4 flex items-center gap-3">

                      <h2 className="shrink-0 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {category.name}
                      </h2>

                      <div className="h-px flex-1 bg-[#ddd4cb]" />

                    </div>

                    {/* ========================= */}
                    {/* PRODUCTS */}
                    {/* ========================= */}

                    {categoryProducts.length > 0 ? (

                      <div className="overflow-hidden rounded-2xl border border-[#e3dbd2] bg-white shadow-sm">

                        <div className="divide-y divide-[#eee7df]">

                          {categoryProducts.map(
                            (product) => (
                              <article
                                key={product.id}
                                className="
                                  p-5
                                  transition
                                  hover:bg-[#fcfaf8]
                                  sm:p-6
                                "
                              >

                                <div className="flex items-start justify-between gap-4 sm:gap-6">

                                  {/* Product Info */}

                                  <div className="min-w-0 flex-1">

                                    <h3 className="break-words text-base font-semibold leading-6 sm:text-lg">
                                      {product.name}
                                    </h3>

                                    {product.description && (
                                      <p className="mt-1.5 max-w-xl break-words text-sm leading-6 text-[#81766e]">
                                        {
                                          product.description
                                        }
                                      </p>
                                    )}

                                  </div>

                                  {/* Price */}

                                  <div className="shrink-0 pt-0.5">

                                    <span className="whitespace-nowrap text-base font-semibold sm:text-lg">
                                      {Number(
                                        product.price
                                      ).toFixed(0)}{" "}
                                      ₺
                                    </span>

                                  </div>

                                </div>

                              </article>
                            )
                          )}

                        </div>

                      </div>

                    ) : (

                      /* ========================= */
                      /* EMPTY CATEGORY */
                      /* ========================= */

                      <div className="rounded-2xl border border-dashed border-[#ddd4cb] bg-white px-6 py-10 text-center">

                        <p className="text-sm text-[#81766e]">
                          Bu kategoride henüz ürün bulunmuyor.
                        </p>

                      </div>

                    )}

                  </section>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}

      <footer className="border-t border-[#e3dbd2] bg-white">

        <div className="mx-auto max-w-3xl px-5 py-8 text-center">

          <p className="text-sm font-medium">
            Butik Cafe
          </p>

          <p className="mt-1 text-xs leading-5 text-[#81766e]">
            Siparişleriniz için garsonumuzla
            iletişime geçebilirsiniz.
          </p>

        </div>

      </footer>

    </main>
  );
}