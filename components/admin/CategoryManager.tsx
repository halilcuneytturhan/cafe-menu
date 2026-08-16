"use client";

import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

interface CategoryManagerProps {
    initialCategories: Category[];
}

interface SortableCategoryProps {
    category: Category;
    saving: boolean;
    onEdit: (category: Category) => void;
    onToggleActive: (category: Category) => void;
    onDelete: (category: Category) => void;
}

function SortableCategory({
    category,
    saving,
    onEdit,
    onToggleActive,
    onDelete,
}: SortableCategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: category.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.65 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            {/* ========================= */}
            {/* CATEGORY INFO */}
            {/* ========================= */}

            <div className="flex min-w-0 items-start gap-3">

                {/* DRAG HANDLE */}

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label={`${category.name} kategorisini taşı`}
                    className="mt-0.5 cursor-grab touch-none rounded-lg border border-[#e3dbd2] px-2.5 py-2 text-[#81766e] active:cursor-grabbing"
                >
                    ⋮⋮
                </button>

                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold">
                            {category.name}
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
                        /{category.slug}
                    </p>

                </div>
            </div>

            {/* ========================= */}
            {/* ACTIONS */}
            {/* ========================= */}

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">

                <button
                    type="button"
                    onClick={() =>
                        onToggleActive(category)
                    }
                    disabled={saving}
                    className="rounded-lg border border-[#ddd4cb] px-3 py-2 text-sm transition hover:bg-[#f4f0ea] disabled:opacity-50"
                >
                    {category.is_active
                        ? "Pasif hale getir"
                        : "Aktif hale getir"}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onEdit(category)
                    }
                    disabled={saving}
                    className="rounded-lg border border-[#ddd4cb] px-3 py-2 text-sm transition hover:bg-[#f4f0ea] disabled:opacity-50"
                >
                    Düzenle
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onDelete(category)
                    }
                    disabled={saving}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                    Sil
                </button>

            </div>
        </div>
    );
}

export default function CategoryManager({
    initialCategories,
}: CategoryManagerProps) {

    const [categories, setCategories] =
        useState<Category[]>(
            [...initialCategories].sort(
                (a, b) =>
                    a.sort_order -
                    b.sort_order
            )
        );

    const [adding, setAdding] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [name, setName] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // =========================
    // SLUG
    // =========================

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

    // =========================
    // DRAG CATEGORY
    // =========================

    async function handleDragEnd(
        event: DragEndEvent
    ) {
        const {
            active,
            over,
        } = event;

        if (!over) return;

        if (
            active.id === over.id
        ) {
            return;
        }

        const oldIndex =
            categories.findIndex(
                (category) =>
                    category.id ===
                    active.id
            );

        const newIndex =
            categories.findIndex(
                (category) =>
                    category.id ===
                    over.id
            );

        if (
            oldIndex === -1 ||
            newIndex === -1
        ) {
            return;
        }

        const newCategories =
            arrayMove(
                categories,
                oldIndex,
                newIndex
            );

        setCategories(
            newCategories.map(
                (category, index) => ({
                    ...category,
                    sort_order:
                        index + 1,
                })
            )
        );

        const supabase =
            createClient();

        setSaving(true);

        const updates =
            newCategories.map(
                (category, index) =>
                    supabase
                        .from("categories")
                        .update({
                            sort_order:
                                index + 1,
                        })
                        .eq(
                            "id",
                            category.id
                        )
            );

        const results =
            await Promise.all(
                updates
            );

        const failed =
            results.find(
                (result) =>
                    result.error
            );

        if (failed?.error) {
            console.error(
                "CATEGORY SORT ERROR:",
                failed.error
            );

            setError(
                `Kategori sırası kaydedilemedi: ${failed.error.message}`
            );
        }

        setSaving(false);
    }

    // =========================
    // ADD
    // =========================

    function openAdd() {
        setName("");
        setSlug("");
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
            setError(
                "Kategori adı boş bırakılamaz."
            );
            return;
        }

        const finalSlug =
            slug.trim()
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

        const supabase =
            createClient();

        const nextSortOrder =
            categories.length + 1;

        const {
            data,
            error,
        } = await supabase
            .from("categories")
            .insert({
                name: name.trim(),
                slug: finalSlug,
                sort_order:
                    nextSortOrder,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            setError(
                `Kategori eklenemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setCategories(
            (current) => [
                ...current,
                data,
            ]
        );

        setSaving(false);
        setAdding(false);
    }

    // =========================
    // EDIT
    // =========================

    function openEdit(
        category: Category
    ) {
        setEditingCategory(category);
        setName(category.name);
        setSlug(category.slug);
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
            setError(
                "Kategori adı boş bırakılamaz."
            );
            return;
        }

        const finalSlug =
            slug.trim()
                ? createSlug(slug)
                : createSlug(name);

        if (!finalSlug) {
            setError(
                "Geçerli bir slug girin."
            );
            return;
        }

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const {
            data,
            error,
        } = await supabase
            .from("categories")
            .update({
                name: name.trim(),
                slug: finalSlug,
            })
            .eq(
                "id",
                editingCategory.id
            )
            .select()
            .single();

        if (error) {
            setError(
                `Kategori güncellenemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setCategories(
            (current) =>
                current.map(
                    (category) =>
                        category.id ===
                            editingCategory.id
                            ? data
                            : category
                )
        );

        setSaving(false);
        setEditingCategory(null);
    }

    // =========================
    // ACTIVE / PASSIVE
    // =========================

    async function handleToggleActive(
        category: Category
    ) {
        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const {
            data,
            error,
        } = await supabase
            .from("categories")
            .update({
                is_active:
                    !category.is_active,
            })
            .eq(
                "id",
                category.id
            )
            .select()
            .single();

        if (error) {
            setError(
                `Kategori durumu değiştirilemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setCategories(
            (current) =>
                current.map(
                    (item) =>
                        item.id ===
                            category.id
                            ? data
                            : item
                )
        );

        setSaving(false);
    }

    // =========================
    // DELETE
    // =========================

    async function handleDelete(
        category: Category
    ) {
        const confirmed =
            window.confirm(
                `"${category.name}" kategorisini silmek istediğinize emin misiniz?`
            );

        if (!confirmed) return;

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const {
            error,
        } = await supabase
            .from("categories")
            .delete()
            .eq(
                "id",
                category.id
            );

        if (error) {
            setError(
                `Kategori silinemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setCategories(
            (current) =>
                current
                    .filter(
                        (item) =>
                            item.id !==
                            category.id
                    )
                    .map(
                        (
                            item,
                            index
                        ) => ({
                            ...item,
                            sort_order:
                                index + 1,
                        })
                    )
        );

        setSaving(false);
    }

    // =========================
    // RENDER
    // =========================

    return (
        <>

            {/* HEADER */}

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="text-xl font-semibold">
                        Kategoriler
                    </h2>

                    <p className="mt-1 text-sm text-[#81766e]">
                        Kategorileri basılı tutup
                        sürükleyerek sıralayın.
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

            {error &&
                !adding &&
                !editingCategory && (
                    <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

            {/* CATEGORY LIST */}

            <DndContext
                sensors={sensors}
                collisionDetection={
                    closestCenter
                }
                onDragEnd={
                    handleDragEnd
                }
            >
                <SortableContext
                    items={categories.map(
                        (category) =>
                            category.id
                    )}
                    strategy={
                        verticalListSortingStrategy
                    }
                >
                    <div className="overflow-hidden rounded-2xl border border-[#e3dbd2] bg-white shadow-sm">

                        {categories.length >
                            0 ? (
                            <div className="divide-y divide-[#eee7df]">
                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <SortableCategory
                                            key={
                                                category.id
                                            }
                                            category={
                                                category
                                            }
                                            saving={
                                                saving
                                            }
                                            onEdit={
                                                openEdit
                                            }
                                            onToggleActive={
                                                handleToggleActive
                                            }
                                            onDelete={
                                                handleDelete
                                            }
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm text-[#81766e]">
                                Henüz kategori bulunmuyor.
                            </div>
                        )}

                    </div>
                </SortableContext>
            </DndContext>

            {/* ADD MODAL */}

            {adding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">

                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">

                        <h2 className="text-xl font-semibold">
                            Yeni Kategori Ekle
                        </h2>

                        <p className="mt-1 text-sm text-[#81766e]">
                            Menüye yeni kategori ekleyin.
                        </p>

                        <div className="mt-6 space-y-5">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori adı
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(
                                            e.target.value
                                        );

                                        if (!slug) {
                                            setSlug(
                                                createSlug(
                                                    e.target.value
                                                )
                                            );
                                        }
                                    }}
                                    placeholder="Örn. Kahveler"
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug
                                </label>

                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) =>
                                        setSlug(
                                            createSlug(
                                                e.target.value
                                            )
                                        )
                                    }
                                    placeholder="kahveler"
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                />
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
                                onClick={closeAdd}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium hover:bg-[#f4f0ea]"
                            >
                                İptal
                            </button>

                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={saving}
                                className="flex-1 rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {saving
                                    ? "Ekleniyor..."
                                    : "Kategoriyi Ekle"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* EDIT MODAL */}

            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">

                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">

                        <h2 className="text-xl font-semibold">
                            Kategoriyi Düzenle
                        </h2>

                        <p className="mt-1 text-sm text-[#81766e]">
                            Kategori bilgilerini güncelleyin.
                        </p>

                        <div className="mt-6 space-y-5">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Kategori adı
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug
                                </label>

                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) =>
                                        setSlug(
                                            createSlug(
                                                e.target.value
                                            )
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                />
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
                                onClick={closeEdit}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium hover:bg-[#f4f0ea]"
                            >
                                İptal
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
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