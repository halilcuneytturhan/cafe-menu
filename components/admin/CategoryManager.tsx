"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
}

interface CategoryManagerProps {
    initialCategories: Category[];
}

const ICON_OPTIONS = [
    {
        value: "coffee",
        label: "Kahve",
    },
    {
        value: "breakfast",
        label: "Kahvaltı",
    },
    {
        value: "hot-drink",
        label: "Sıcak İçecek",
    },
    {
        value: "cold-drink",
        label: "Soğuk İçecek",
    },
    {
        value: "dessert",
        label: "Tatlı",
    },
    {
        value: "snack",
        label: "Atıştırmalık",
    },
    {
        value: "extra",
        label: "Ekstra",
    },
    {
        value: "food",
        label: "Yiyecek",
    },
];

function CategoryIcon({
    icon,
    className = "h-5 w-5",
}: {
    icon: string;
    className?: string;
}) {
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
                    <path d="M4 18h16" strokeLinecap="round" />
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
                    <circle cx="12" cy="12" r="8" />
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

export default function CategoryManager({
    initialCategories,
}: CategoryManagerProps) {
    const [categories, setCategories] =
        useState<Category[]>(initialCategories);

    const [adding, setAdding] = useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [icon, setIcon] = useState("coffee");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [draggedCategoryId, setDraggedCategoryId] =
        useState<number | null>(null);

    // =====================================================
    // SLUG
    // =====================================================

    function createSlug(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    // =====================================================
    // ADD
    // =====================================================

    function openAdd() {
        setName("");
        setSlug("");
        setIcon("coffee");
        setError("");
        setAdding(true);
    }

    function closeAdd() {
        if (saving) return;

        setAdding(false);
        setError("");
    }

    async function handleAdd() {
        if (!name.trim()) {
            setError("Kategori adı boş bırakılamaz.");
            return;
        }

        const finalSlug = slug.trim()
            ? createSlug(slug)
            : createSlug(name);

        if (!finalSlug) {
            setError(
                "Geçerli bir kategori adı veya slug girin."
            );
            return;
        }

        setSaving(true);
        setError("");

        const supabase = createClient();

        const nextSortOrder =
            categories.length > 0
                ? Math.max(
                    ...categories.map(
                        (category) =>
                            category.sort_order
                    )
                ) + 1
                : 1;

        const { data, error } = await supabase
            .from("categories")
            .insert({
                name: name.trim(),
                slug: finalSlug,
                icon,
                sort_order: nextSortOrder,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error(
                "CATEGORY INSERT ERROR:",
                error
            );

            setError(
                `Kategori eklenemedi: ${error.message}`
            );

            setSaving(false);
            return;
        }

        setCategories((currentCategories) => [
            ...currentCategories,
            data,
        ]);

        setName("");
        setSlug("");
        setIcon("coffee");
        setSaving(false);
        setAdding(false);
    }

    // =====================================================
    // EDIT
    // =====================================================

    function openEdit(category: Category) {
        setEditingCategory(category);

        setName(category.name);
        setSlug(category.slug);
        setIcon(category.icon || "coffee");

        setError("");
    }

    function closeEdit() {
        if (saving) return;

        setEditingCategory(null);
        setError("");
    }

    async function handleSave() {
        if (!editingCategory) return;

        if (!name.trim()) {
            setError("Kategori adı boş bırakılamaz.");
            return;
        }

        const finalSlug = slug.trim()
            ? createSlug(slug)
            : createSlug(name);

        if (!finalSlug) {
            setError(
                "Geçerli bir kategori slug değeri girin."
            );
            return;
        }

        setSaving(true);
        setError("");

        const supabase = createClient();

        const { data, error } = await supabase
            .from("categories")
            .update({
                name: name.trim(),
                slug: finalSlug,
                icon,
            })
            .eq("id", editingCategory.id)
            .select()
            .single();

        if (error) {
            console.error(
                "CATEGORY UPDATE ERROR:",
                error
            );

            setError(
                `Kategori güncellenemedi: ${error.message}`
            );

            setSaving(false);
            return;
        }

        setCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id === editingCategory.id
                    ? data
                    : category
            )
        );

        setSaving(false);
        setEditingCategory(null);
    }

    // =====================================================
    // ACTIVE / PASSIVE
    // =====================================================

    async function handleToggleActive(
        category: Category
    ) {
        setSaving(true);
        setError("");

        const supabase = createClient();

        const { data, error } = await supabase
            .from("categories")
            .update({
                is_active: !category.is_active,
            })
            .eq("id", category.id)
            .select()
            .single();

        if (error) {
            console.error(
                "CATEGORY ACTIVE UPDATE ERROR:",
                error
            );

            setError(
                `Kategori durumu değiştirilemedi: ${error.message}`
            );

            setSaving(false);
            return;
        }

        setCategories((currentCategories) =>
            currentCategories.map((currentCategory) =>
                currentCategory.id === category.id
                    ? data
                    : currentCategory
            )
        );

        setSaving(false);
    }

    // =====================================================
    // DELETE
    // =====================================================

    async function handleDelete(category: Category) {
        const confirmed = window.confirm(
            `"${category.name}" kategorisini silmek istediğinize emin misiniz?`
        );

        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");

        const supabase = createClient();

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", category.id);

        if (error) {
            console.error(
                "CATEGORY DELETE ERROR:",
                error
            );

            setError(
                `Kategori silinemedi: ${error.message}`
            );

            setSaving(false);
            return;
        }

        const remainingCategories =
            categories.filter(
                (currentCategory) =>
                    currentCategory.id !== category.id
            );

        const normalizedCategories =
            remainingCategories.map(
                (currentCategory, index) => ({
                    ...currentCategory,
                    sort_order: index + 1,
                })
            );

        setCategories(normalizedCategories);

        // Sıralamaları tekrar düzenle
        const updates =
            normalizedCategories.map(
                (currentCategory) =>
                    supabase
                        .from("categories")
                        .update({
                            sort_order:
                                currentCategory.sort_order,
                        })
                        .eq(
                            "id",
                            currentCategory.id
                        )
            );

        await Promise.all(updates);

        setSaving(false);
    }

    // =====================================================
    // DRAG & DROP
    // =====================================================

    function handleDragStart(
        categoryId: number
    ) {
        setDraggedCategoryId(categoryId);
    }

    function handleDragOver(
        event: React.DragEvent<HTMLDivElement>,
        targetCategoryId: number
    ) {
        event.preventDefault();

        if (
            draggedCategoryId === null ||
            draggedCategoryId === targetCategoryId
        ) {
            return;
        }

        setCategories((currentCategories) => {
            const draggedIndex =
                currentCategories.findIndex(
                    (category) =>
                        category.id ===
                        draggedCategoryId
                );

            const targetIndex =
                currentCategories.findIndex(
                    (category) =>
                        category.id ===
                        targetCategoryId
                );

            if (
                draggedIndex === -1 ||
                targetIndex === -1
            ) {
                return currentCategories;
            }

            const updatedCategories = [
                ...currentCategories,
            ];

            const [draggedCategory] =
                updatedCategories.splice(
                    draggedIndex,
                    1
                );

            updatedCategories.splice(
                targetIndex,
                0,
                draggedCategory
            );

            return updatedCategories;
        });
    }

    async function handleDragEnd() {
        if (draggedCategoryId === null) {
            return;
        }

        setDraggedCategoryId(null);
        setSaving(true);
        setError("");

        const supabase = createClient();

        const currentCategories =
            [...categories];

        const normalizedCategories =
            currentCategories.map(
                (category, index) => ({
                    ...category,
                    sort_order: index + 1,
                })
            );

        setCategories(normalizedCategories);

        const results =
            await Promise.all(
                normalizedCategories.map(
                    (category) =>
                        supabase
                            .from("categories")
                            .update({
                                sort_order:
                                    category.sort_order,
                            })
                            .eq(
                                "id",
                                category.id
                            )
                )
            );

        const failedUpdate =
            results.find(
                (result) => result.error
            );

        if (failedUpdate?.error) {
            console.error(
                "CATEGORY SORT ERROR:",
                failedUpdate.error
            );

            setError(
                `Kategori sırası kaydedilemedi: ${failedUpdate.error.message}`
            );
        }

        setSaving(false);
    }

    return (
        <>
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Kategoriler
                    </h2>

                    <p className="mt-1 text-sm text-[#81766e]">
                        Menü kategorilerini yönetin ve
                        sıralayın.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAdd}
                    className="w-full rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3631] sm:w-auto"
                >
                    + Kategori Ekle
                </button>
            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error &&
                !adding &&
                !editingCategory && (
                    <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

            {/* ================================================= */}
            {/* CATEGORY LIST */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-[#e3dbd2] bg-white shadow-sm">
                {categories.length > 0 ? (
                    <div className="divide-y divide-[#eee7df]">
                        {categories.map(
                            (
                                category,
                                index
                            ) => (
                                <div
                                    key={
                                        category.id
                                    }
                                    draggable={
                                        !saving
                                    }
                                    onDragStart={() =>
                                        handleDragStart(
                                            category.id
                                        )
                                    }
                                    onDragOver={(
                                        event
                                    ) =>
                                        handleDragOver(
                                            event,
                                            category.id
                                        )
                                    }
                                    onDragEnd={
                                        handleDragEnd
                                    }
                                    className={`
                                        flex
                                        cursor-grab
                                        flex-col
                                        gap-4
                                        p-5
                                        transition
                                        active:cursor-grabbing
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                        ${draggedCategoryId ===
                                            category.id
                                            ? "bg-[#f4f0ea] opacity-60"
                                            : "hover:bg-[#fcfaf8]"
                                        }
                                    `}
                                >
                                    {/* LEFT */}
                                    <div className="flex min-w-0 items-center gap-4">
                                        {/* Order */}

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f0ea] text-xs font-semibold text-[#81766e]">
                                            {index +
                                                1}
                                        </div>

                                        {/* Icon */}

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e3dbd2] bg-[#f8f5f1] text-[#5f5750]">
                                            <CategoryIcon
                                                icon={
                                                    category.icon
                                                }
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        {/* Info */}

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">
                                                    {
                                                        category.name
                                                    }
                                                </h3>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs ${category.is_active
                                                            ? "bg-green-50 text-green-600"
                                                            : "bg-gray-100 text-gray-500"
                                                        }`}
                                                >
                                                    {category.is_active
                                                        ? "Aktif"
                                                        : "Pasif"}
                                                </span>
                                            </div>

                                            <p className="mt-1 break-words text-sm text-[#81766e]">
                                                /
                                                {
                                                    category.slug
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* BUTTONS */}

                                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleActive(
                                                    category
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-lg border border-[#ddd4cb] px-3 py-2 text-sm transition hover:bg-[#f4f0ea] disabled:opacity-50"
                                        >
                                            {category.is_active
                                                ? "Pasif hale getir"
                                                : "Aktif hale getir"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEdit(
                                                    category
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-lg border border-[#ddd4cb] px-3 py-2 text-sm transition hover:bg-[#f4f0ea] disabled:opacity-50"
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    category
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-[#81766e]">
                        Henüz kategori bulunmuyor.
                    </div>
                )}
            </div>

            {/* ================================================= */}
            {/* ADD MODAL */}
            {/* ================================================= */}

            {adding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Yeni Kategori Ekle
                            </h2>

                            <p className="mt-1 text-sm text-[#81766e]">
                                Menüye yeni bir kategori
                                ekleyin.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* NAME */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori adı
                                </label>

                                <input
                                    type="text"
                                    value={
                                        name
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setName(
                                            event
                                                .target
                                                .value
                                        );

                                        if (
                                            !slug
                                        ) {
                                            setSlug(
                                                createSlug(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            );
                                        }
                                    }}
                                    placeholder="Örn. Kahveler"
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] outline-none focus:border-[#292622]"
                                />
                            </div>

                            {/* SLUG */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug
                                </label>

                                <input
                                    type="text"
                                    value={
                                        slug
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSlug(
                                            createSlug(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    placeholder="kahveler"
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] outline-none focus:border-[#292622]"
                                />
                            </div>

                            {/* ICON */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori ikonu
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    {ICON_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <button
                                                key={
                                                    option.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setIcon(
                                                        option.value
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${icon ===
                                                        option.value
                                                        ? "border-[#292622] bg-[#f4f0ea] text-[#292622]"
                                                        : "border-[#ddd4cb] hover:bg-[#f8f5f1]"
                                                    }`}
                                            >
                                                <CategoryIcon
                                                    icon={
                                                        option.value
                                                    }
                                                    className="h-5 w-5"
                                                />

                                                {
                                                    option.label
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={
                                    closeAdd
                                }
                                disabled={
                                    saving
                                }
                                className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium transition hover:bg-[#f4f0ea] disabled:opacity-50"
                            >
                                İptal
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleAdd
                                }
                                disabled={
                                    saving
                                }
                                className="flex-1 rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3631] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Ekleniyor..."
                                    : "Kategoriyi Ekle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* EDIT MODAL */}
            {/* ================================================= */}

            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                Kategoriyi Düzenle
                            </h2>

                            <p className="mt-1 text-sm text-[#81766e]">
                                Kategori bilgilerini
                                güncelleyin.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* NAME */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori adı
                                </label>

                                <input
                                    type="text"
                                    value={
                                        name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] outline-none focus:border-[#292622]"
                                />
                            </div>

                            {/* SLUG */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug
                                </label>

                                <input
                                    type="text"
                                    value={
                                        slug
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSlug(
                                            createSlug(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm text-[#292622] outline-none focus:border-[#292622]"
                                />
                            </div>

                            {/* ICON */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori ikonu
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    {ICON_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <button
                                                key={
                                                    option.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setIcon(
                                                        option.value
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${icon ===
                                                        option.value
                                                        ? "border-[#292622] bg-[#f4f0ea] text-[#292622]"
                                                        : "border-[#ddd4cb] hover:bg-[#f8f5f1]"
                                                    }`}
                                            >
                                                <CategoryIcon
                                                    icon={
                                                        option.value
                                                    }
                                                    className="h-5 w-5"
                                                />

                                                {
                                                    option.label
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={
                                    closeEdit
                                }
                                disabled={
                                    saving
                                }
                                className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium transition hover:bg-[#f4f0ea] disabled:opacity-50"
                            >
                                İptal
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleSave
                                }
                                disabled={
                                    saving
                                }
                                className="flex-1 rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3631] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Kaydediliyor..."
                                    : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}