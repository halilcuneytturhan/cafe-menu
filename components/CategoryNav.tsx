import Link from "next/link";

type Category = {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
};

type CategoryNavProps = {
    categories: Category[];
    activeCategory?: string;
};

export default function CategoryNav({
    categories,
    activeCategory,
}: CategoryNavProps) {
    return (
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3dbd2] px-4 py-3">
            <Link
                href="/"
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${!activeCategory
                        ? "bg-[#292622] text-white"
                        : "bg-[#f4efe9] text-[#625950]"
                    }`}
            >
                Tümü
            </Link>

            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/?category=${category.slug}`}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === category.slug
                            ? "bg-[#292622] text-white"
                            : "bg-[#f4efe9] text-[#625950]"
                        }`}
                >
                    {category.name}
                </Link>
            ))}
        </nav>
    );
}