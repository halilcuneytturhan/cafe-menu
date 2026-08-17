import { createClient } from "@/lib/supabase/server";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
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

function CategoryIcon({
  icon,
}: {
  icon: string;
}) {
  const className = "h-4 w-4 shrink-0";

  switch (icon) {
    case "breakfast":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path
            d="M4 19h16"
            strokeLinecap="round"
          />
          <path
            d="M5 15h14"
            strokeLinecap="round"
          />
          <path d="M7 15V8h10v7" />
          <path
            d="M9 8V5"
            strokeLinecap="round"
          />
          <path
            d="M15 8V5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "hot-drink":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
          <path
            d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"
            strokeLinecap="round"
          />
          <path
            d="M8 4c0 1 1 1.2 1 2.2"
            strokeLinecap="round"
          />
          <path
            d="M12 4c0 1 1 1.2 1 2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "cold-drink":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path d="M6 5h12l-1 15H7L6 5Z" />
          <path
            d="M9 2h6"
            strokeLinecap="round"
          />
          <path
            d="M15 5l2-3"
            strokeLinecap="round"
          />
          <path
            d="M10 9h4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "dessert":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path
            d="M4 18h16"
            strokeLinecap="round"
          />
          <path d="M6 18l2-9h8l2 9" />
          <path d="M7 9h10" />
          <path
            d="M9 6c1-2 5-2 6 0"
            strokeLinecap="round"
          />
        </svg>
      );

    case "snack":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path
            d="M5 13h14"
            strokeLinecap="round"
          />
          <path d="M6 13a6 6 0 0 1 12 0" />
          <path
            d="M8 17h8"
            strokeLinecap="round"
          />
          <path
            d="M9 13v2M12 13v2M15 13v2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "extra":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <circle
            cx="12"
            cy="12"
            r="8"
          />
          <path
            d="M12 8v8M8 12h8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "food":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path
            d="M4 15h16"
            strokeLinecap="round"
          />
          <path d="M6 15a6 6 0 0 1 12 0" />
          <path
            d="M8 18h8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "coffee":
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
          <path
            d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"
            strokeLinecap="round"
          />
          <path
            d="M7 4c0 1 1 1.2 1 2.2"
            strokeLinecap="round"
          />
          <path
            d="M11 4c0 1 1 1.2 1 2.2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default async function HomePage() {
  const supabase = await createClient();

  // =====================================================
  // CATEGORIES
  // =====================================================

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  // =====================================================
  // PRODUCTS
  // =====================================================

  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  // =====================================================
  // ERRORS
  // =====================================================

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

  // =====================================================
  // DATA
  // =====================================================

  const activeCategories: Category[] =
    categories ?? [];

  const activeProducts: Product[] =
    products ?? [];

  return (
    <main className="min-h-screen bg-[#f4f0ea] text-[#292622]">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <header className="relative overflow-hidden border-b border-[#e3dbd2]">

        {/* Background */}

        <img
          src="/kozalakkafe.jpeg"
          alt="Kozalak Cafe"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />

        {/* Content */}

        <div className="relative mx-auto flex min-h-[320px] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center text-white sm:min-h-[380px]">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">
            KOZALAK CAFE
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Menü
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
            Kahve, tatlı ve lezzetli
            seçeneklerimizi keşfedin.
          </p>

        </div>

      </header>

      {/* ================================================= */}
      {/* CATEGORY NAVIGATION */}
      {/* ================================================= */}

      {activeCategories.length > 0 && (
        <nav className="sticky top-0 z-40 border-b border-[#e3dbd2] bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto max-w-3xl">

            <div className="overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">

              <div className="flex min-w-max items-center gap-2 py-3">

                {activeCategories.map(
                  (category) => (
                    <a
                      key={
                        category.id
                      }
                      href={`#${category.slug}`}
                      className="
                                                flex
                                                items-center
                                                gap-2
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
                      <CategoryIcon
                        icon={
                          category.icon
                        }
                      />

                      <span>
                        {
                          category.name
                        }
                      </span>
                    </a>
                  )
                )}

              </div>

            </div>

          </div>

        </nav>
      )}

      {/* ================================================= */}
      {/* MENU */}
      {/* ================================================= */}

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {activeCategories.length ===
          0 ? (
          <div className="rounded-2xl border border-[#e3dbd2] bg-white p-8 text-center shadow-sm">

            <p className="text-sm text-[#81766e]">
              Menüde henüz kategori
              bulunmuyor.
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
                    key={
                      category.id
                    }
                    id={
                      category.slug
                    }
                    className="scroll-mt-20"
                  >

                    {/* CATEGORY TITLE */}

                    <div className="mb-4 flex items-center gap-3">

                      <div className="flex shrink-0 items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#5f5750] shadow-sm">

                          <CategoryIcon
                            icon={
                              category.icon
                            }
                          />

                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                          {
                            category.name
                          }
                        </h2>

                      </div>

                      <div className="h-px flex-1 bg-[#ddd4cb]" />

                    </div>

                    {/* PRODUCTS */}

                    {categoryProducts.length >
                      0 ? (
                      <div className="overflow-hidden rounded-2xl border border-[#e3dbd2] bg-white shadow-sm">

                        <div className="divide-y divide-[#eee7df]">

                          {categoryProducts.map(
                            (
                              product
                            ) => (
                              <article
                                key={
                                  product.id
                                }
                                className="p-5 transition hover:bg-[#fcfaf8] sm:p-6"
                              >

                                <div className="flex items-start justify-between gap-4 sm:gap-6">

                                  {/* PRODUCT INFO */}

                                  <div className="min-w-0 flex-1">

                                    <h3 className="break-words text-base font-semibold leading-6 sm:text-lg">
                                      {
                                        product.name
                                      }
                                    </h3>

                                    {product.description && (
                                      <p className="mt-1.5 max-w-xl break-words text-sm leading-6 text-[#81766e]">
                                        {
                                          product.description
                                        }
                                      </p>
                                    )}

                                  </div>

                                  {/* PRICE */}

                                  <div className="shrink-0 pt-0.5">

                                    <span className="whitespace-nowrap text-base font-semibold sm:text-lg">
                                      {Number(
                                        product.price
                                      ).toFixed(
                                        0
                                      )}{" "}
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

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-[#e3dbd2] bg-white">

        <div className="mx-auto max-w-3xl px-5 py-8 text-center">

          <p className="text-sm font-medium">
            KOZALAK CAFE
          </p>

          <p className="mt-1 text-xs leading-5 text-[#81766e]">
            Siparişleriniz için
            garsonumuzla iletişime
            geçebilirsiniz.
          </p>

        </div>

      </footer>

    </main>
  );
}