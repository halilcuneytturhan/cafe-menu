"use client";

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    PointerSensor,
    closestCorners,
    useDroppable,
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

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category_id: number;
    is_active?: boolean;
    sort_order?: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

interface ProductManagerProps {
    initialProducts: Product[];
    categories: Category[];
}

interface SortableProductProps {
    product: Product;
    saving: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

function SortableProduct({
    product,
    saving,
    onEdit,
    onDelete,
}: SortableProductProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: product.id,
    });

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),
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
            {/* PRODUCT */}
            {/* ========================= */}

            <div className="flex min-w-0 items-start gap-3">

                {/* DRAG HANDLE */}

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label={`${product.name} ürününü taşı`}
                    className="mt-0.5 cursor-grab touch-none rounded-lg border border-[#e3dbd2] px-2.5 py-2 text-[#81766e] active:cursor-grabbing"
                >
                    ⋮⋮
                </button>

                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                        <h4 className="font-semibold">
                            {product.name}
                        </h4>

                        {product.is_active ===
                            false && (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                    Pasif
                                </span>
                            )}

                    </div>

                    <p className="mt-1 text-sm text-[#81766e]">
                        {product.description ||
                            "Açıklama bulunmuyor."}
                    </p>

                </div>

            </div>

            {/* ========================= */}
            {/* PRICE + ACTIONS */}
            {/* ========================= */}

            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">

                <span className="mr-1 font-semibold">
                    {Number(
                        product.price
                    ).toFixed(0)}{" "}
                    ₺
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onEdit(product)
                    }
                    disabled={saving}
                    className="rounded-lg border border-[#ddd4cb] px-3 py-2 text-sm transition hover:bg-[#f4f0ea] disabled:opacity-50"
                >
                    Düzenle
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onDelete(product)
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

interface CategoryDropZoneProps {
    categoryId: number;
    children: React.ReactNode;
}

function CategoryDropZone({
    categoryId,
    children,
}: CategoryDropZoneProps) {
    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id: `category-${categoryId}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[60px] transition ${isOver
                    ? "bg-[#f4f0ea]"
                    : ""
                }`}
        >
            {children}
        </div>
    );
}

export default function ProductManager({
    initialProducts,
    categories,
}: ProductManagerProps) {

    const [products, setProducts] =
        useState<Product[]>(
            [...initialProducts].sort(
                (a, b) =>
                    (a.sort_order ?? 0) -
                    (b.sort_order ?? 0)
            )
        );

    // =========================
    // EDIT STATE
    // =========================

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [price, setPrice] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    // =========================
    // ADD STATE
    // =========================

    const [adding, setAdding] =
        useState(false);

    const [newName, setNewName] =
        useState("");

    const [newDescription, setNewDescription] =
        useState("");

    const [newPrice, setNewPrice] =
        useState("");

    const [newCategoryId, setNewCategoryId] =
        useState("");

    // =========================
    // GENERAL
    // =========================

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // =========================
    // DRAG
    // =========================

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // =========================
    // GET CATEGORY PRODUCTS
    // =========================

    function getCategoryProducts(
        categoryId: number
    ) {
        return products
            .filter(
                (product) =>
                    product.category_id ===
                    categoryId
            )
            .sort(
                (a, b) =>
                    (a.sort_order ?? 0) -
                    (b.sort_order ?? 0)
            );
    }

    // =========================
    // FIND PRODUCT
    // =========================

    function findProduct(
        id: number
    ) {
        return products.find(
            (product) =>
                product.id === id
        );
    }

    // =========================
    // FIND CATEGORY FROM DROP ID
    // =========================

    function getCategoryIdFromDrop(
        id: string | number
    ) {
        if (
            typeof id === "string" &&
            id.startsWith("category-")
        ) {
            return Number(
                id.replace(
                    "category-",
                    ""
                )
            );
        }

        const product =
            findProduct(
                Number(id)
            );

        return product?.category_id;
    }

    // =========================
    // DRAG OVER
    // =========================

    function handleDragOver(
        event: DragOverEvent
    ) {
        const {
            active,
            over,
        } = event;

        if (!over) return;

        const activeId =
            Number(active.id);

        const activeProduct =
            findProduct(activeId);

        if (!activeProduct) return;

        const targetCategoryId =
            getCategoryIdFromDrop(
                over.id
            );

        if (
            !targetCategoryId ||
            activeProduct.category_id ===
            targetCategoryId
        ) {
            return;
        }

        setProducts(
            (currentProducts) =>
                currentProducts.map(
                    (product) =>
                        product.id ===
                            activeProduct.id
                            ? {
                                ...product,
                                category_id:
                                    targetCategoryId,
                            }
                            : product
                )
        );
    }

    // =========================
    // DRAG END
    // =========================

    async function handleDragEnd(
        event: DragEndEvent
    ) {
        const {
            active,
            over,
        } = event;

        if (!over) return;

        const activeId =
            Number(active.id);

        const activeProduct =
            findProduct(activeId);

        if (!activeProduct) return;

        const targetCategoryId =
            getCategoryIdFromDrop(
                over.id
            );

        if (!targetCategoryId) {
            return;
        }

        const categoryProducts =
            getCategoryProducts(
                targetCategoryId
            );

        let reorderedProducts =
            [...categoryProducts];

        const oldIndex =
            reorderedProducts.findIndex(
                (product) =>
                    product.id ===
                    activeId
            );

        let newIndex =
            reorderedProducts.findIndex(
                (product) =>
                    product.id ===
                    Number(over.id)
            );

        if (
            typeof over.id === "string" &&
            over.id.startsWith(
                "category-"
            )
        ) {
            newIndex =
                reorderedProducts.length;
        }

        if (
            oldIndex !== -1 &&
            newIndex !== -1 &&
            oldIndex !== newIndex
        ) {
            reorderedProducts =
                arrayMove(
                    reorderedProducts,
                    oldIndex,
                    newIndex
                );
        }

        if (oldIndex === -1) {
            const withoutActive =
                reorderedProducts.filter(
                    (product) =>
                        product.id !==
                        activeId
                );

            const movedProduct =
                findProduct(activeId);

            if (movedProduct) {
                let insertIndex =
                    withoutActive.length;

                if (
                    typeof over.id ===
                    "number" ||
                    (
                        typeof over.id ===
                        "string" &&
                        !over.id.startsWith(
                            "category-"
                        )
                    )
                ) {
                    const targetIndex =
                        withoutActive.findIndex(
                            (product) =>
                                product.id ===
                                Number(
                                    over.id
                                )
                        );

                    if (
                        targetIndex !==
                        -1
                    ) {
                        insertIndex =
                            targetIndex;
                    }
                }

                withoutActive.splice(
                    insertIndex,
                    0,
                    {
                        ...movedProduct,
                        category_id:
                            targetCategoryId,
                    }
                );

                reorderedProducts =
                    withoutActive;
            }
        }

        // =========================
        // BUILD FINAL PRODUCTS
        // =========================

        const allCategoryProducts =
            products.filter(
                (product) =>
                    product.category_id !==
                    targetCategoryId
            );

        const finalTargetProducts =
            reorderedProducts.map(
                (
                    product,
                    index
                ) => ({
                    ...product,
                    category_id:
                        targetCategoryId,
                    sort_order:
                        index + 1,
                })
            );

        const finalProducts = [
            ...allCategoryProducts,
            ...finalTargetProducts,
        ];

        // Rebuild order for every category
        const normalizedProducts =
            categories.flatMap(
                (category) =>
                    finalProducts
                        .filter(
                            (product) =>
                                product.category_id ===
                                category.id
                        )
                        .sort(
                            (a, b) =>
                                (a.sort_order ??
                                    0) -
                                (b.sort_order ??
                                    0)
                        )
                        .map(
                            (
                                product,
                                index
                            ) => ({
                                ...product,
                                sort_order:
                                    index + 1,
                            })
                        )
            );

        setProducts(
            normalizedProducts
        );

        // =========================
        // SAVE DATABASE
        // =========================

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const updates =
            normalizedProducts.map(
                (product) =>
                    supabase
                        .from("products")
                        .update({
                            category_id:
                                product.category_id,
                            sort_order:
                                product.sort_order,
                        })
                        .eq(
                            "id",
                            product.id
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
                "PRODUCT SORT ERROR:",
                failed.error
            );

            setError(
                `Ürün sırası kaydedilemedi: ${failed.error.message}`
            );
        }

        setSaving(false);
    }

    // =========================
    // EDIT
    // =========================

    function openEdit(
        product: Product
    ) {
        setEditingProduct(product);

        setName(product.name);

        setDescription(
            product.description ??
            ""
        );

        setPrice(
            String(product.price)
        );

        setCategoryId(
            String(
                product.category_id
            )
        );

        setError("");
    }

    function closeEdit() {
        if (saving) return;

        setEditingProduct(null);
        setError("");
    }

    async function handleSave() {
        if (!editingProduct) return;

        if (!name.trim()) {
            setError(
                "Ürün adı boş bırakılamaz."
            );
            return;
        }

        if (
            !price ||
            Number(price) < 0 ||
            Number.isNaN(
                Number(price)
            )
        ) {
            setError(
                "Geçerli bir fiyat girin."
            );
            return;
        }

        if (!categoryId) {
            setError(
                "Lütfen bir kategori seçin."
            );
            return;
        }

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const newCategory =
            Number(categoryId);

        const categoryProducts =
            getCategoryProducts(
                newCategory
            ).filter(
                (product) =>
                    product.id !==
                    editingProduct.id
            );

        const newSortOrder =
            editingProduct.category_id ===
                newCategory
                ? editingProduct.sort_order ??
                1
                : categoryProducts.length +
                1;

        const {
            data,
            error,
        } = await supabase
            .from("products")
            .update({
                name: name.trim(),
                description:
                    description.trim(),
                price: Number(price),
                category_id:
                    newCategory,
                sort_order:
                    newSortOrder,
            })
            .eq(
                "id",
                editingProduct.id
            )
            .select()
            .single();

        if (error) {
            setError(
                `Ürün güncellenemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setProducts(
            (current) =>
                current.map(
                    (product) =>
                        product.id ===
                            editingProduct.id
                            ? data
                            : product
                )
        );

        setSaving(false);
        setEditingProduct(null);
    }

    // =========================
    // DELETE
    // =========================

    async function handleDelete(
        product: Product
    ) {
        const confirmed =
            window.confirm(
                `"${product.name}" ürününü silmek istediğinize emin misiniz?`
            );

        if (!confirmed) return;

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const {
            error,
        } = await supabase
            .from("products")
            .delete()
            .eq(
                "id",
                product.id
            );

        if (error) {
            setError(
                `Ürün silinemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        const remaining =
            products
                .filter(
                    (item) =>
                        item.id !==
                        product.id
                )
                .map(
                    (item) =>
                        item.category_id ===
                            product.category_id
                            ? {
                                ...item,
                                sort_order:
                                    item.sort_order ??
                                    1,
                            }
                            : item
                );

        const categoryProducts =
            remaining
                .filter(
                    (item) =>
                        item.category_id ===
                        product.category_id
                )
                .sort(
                    (a, b) =>
                        (a.sort_order ??
                            0) -
                        (b.sort_order ??
                            0)
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
                );

        const finalProducts =
            remaining.map(
                (item) =>
                    item.category_id ===
                        product.category_id
                        ? categoryProducts.find(
                            (
                                p
                            ) =>
                                p.id ===
                                item.id
                        ) ?? item
                        : item
            );

        setProducts(
            finalProducts
        );

        setSaving(false);
    }

    // =========================
    // ADD
    // =========================

    function openAdd(
        selectedCategoryId?: number
    ) {
        setNewName("");
        setNewDescription("");
        setNewPrice("");

        setNewCategoryId(
            selectedCategoryId
                ? String(
                    selectedCategoryId
                )
                : ""
        );

        setError("");
        setAdding(true);
    }

    function closeAdd() {
        if (saving) return;

        setAdding(false);
        setError("");
    }

    async function handleAdd() {
        if (!newName.trim()) {
            setError(
                "Ürün adı boş bırakılamaz."
            );
            return;
        }

        if (
            !newPrice ||
            Number(newPrice) < 0 ||
            Number.isNaN(
                Number(newPrice)
            )
        ) {
            setError(
                "Geçerli bir fiyat girin."
            );
            return;
        }

        if (!newCategoryId) {
            setError(
                "Lütfen bir kategori seçin."
            );
            return;
        }

        setSaving(true);
        setError("");

        const supabase =
            createClient();

        const categoryProducts =
            getCategoryProducts(
                Number(
                    newCategoryId
                )
            );

        const {
            data,
            error,
        } = await supabase
            .from("products")
            .insert({
                name: newName.trim(),
                description:
                    newDescription.trim(),
                price: Number(
                    newPrice
                ),
                category_id:
                    Number(
                        newCategoryId
                    ),
                is_active: true,
                sort_order:
                    categoryProducts.length +
                    1,
            })
            .select()
            .single();

        if (error) {
            setError(
                `Ürün eklenemedi: ${error.message}`
            );
            setSaving(false);
            return;
        }

        setProducts(
            (current) => [
                ...current,
                data,
            ]
        );

        setSaving(false);
        setAdding(false);
    }

    // =========================
    // RENDER
    // =========================

    return (
        <>
            <div>

                {/* HEADER */}

                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Ürünler
                    </h2>

                    <p className="mt-1 text-sm text-[#81766e]">
                        Ürünleri basılı tutup
                        sürükleyerek sıralayın
                        veya başka kategoriye taşıyın.
                    </p>
                </div>

                {error &&
                    !adding &&
                    !editingProduct && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                {/* ========================= */}
                {/* DRAG CONTEXT */}
                {/* ========================= */}

                <DndContext
                    sensors={sensors}
                    collisionDetection={
                        closestCorners
                    }
                    onDragOver={
                        handleDragOver
                    }
                    onDragEnd={
                        handleDragEnd
                    }
                >

                    <div className="space-y-6">

                        {categories.map(
                            (category) => {

                                const categoryProducts =
                                    getCategoryProducts(
                                        category.id
                                    );

                                return (
                                    <div
                                        key={
                                            category.id
                                        }
                                        className="overflow-hidden rounded-2xl border border-[#e3dbd2] bg-white shadow-sm"
                                    >

                                        {/* CATEGORY HEADER */}

                                        <div className="flex flex-col gap-3 border-b border-[#eee7df] bg-[#faf8f5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div>

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h3 className="text-lg font-semibold">
                                                        {
                                                            category.name
                                                        }
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs ${category.is_active
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-100 text-gray-500"
                                                            }`}
                                                    >
                                                        {category.is_active
                                                            ? "Aktif"
                                                            : "Pasif"}
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-sm text-[#81766e]">
                                                    {
                                                        categoryProducts.length
                                                    }{" "}
                                                    ürün
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openAdd(
                                                        category.id
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                className="w-full rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a3631] disabled:opacity-50 sm:w-auto"
                                            >
                                                + Ürün Ekle
                                            </button>

                                        </div>

                                        {/* PRODUCTS */}

                                        <CategoryDropZone
                                            categoryId={
                                                category.id
                                            }
                                        >

                                            {categoryProducts.length >
                                                0 ? (
                                                <SortableContext
                                                    items={categoryProducts.map(
                                                        (
                                                            product
                                                        ) =>
                                                            product.id
                                                    )}
                                                    strategy={
                                                        verticalListSortingStrategy
                                                    }
                                                >

                                                    <div className="divide-y divide-[#eee7df]">

                                                        {categoryProducts.map(
                                                            (
                                                                product
                                                            ) => (
                                                                <SortableProduct
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    product={
                                                                        product
                                                                    }
                                                                    saving={
                                                                        saving
                                                                    }
                                                                    onEdit={
                                                                        openEdit
                                                                    }
                                                                    onDelete={
                                                                        handleDelete
                                                                    }
                                                                />
                                                            )
                                                        )}

                                                    </div>

                                                </SortableContext>
                                            ) : (
                                                <div className="px-5 py-8 text-center">

                                                    <p className="text-sm text-[#81766e]">
                                                        Bu kategoride henüz ürün bulunmuyor.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAdd(
                                                                category.id
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                        className="mt-3 text-sm font-medium underline underline-offset-4 hover:opacity-70"
                                                    >
                                                        Bu kategoriye ürün ekle
                                                    </button>

                                                    <p className="mt-3 text-xs text-[#aaa098]">
                                                        Ürünü buraya sürükleyerek de taşıyabilirsiniz.
                                                    </p>

                                                </div>
                                            )}

                                        </CategoryDropZone>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </DndContext>

                {/* ========================= */}
                {/* ADD MODAL */}
                {/* ========================= */}

                {adding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">

                        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold">
                                Yeni Ürün Ekle
                            </h2>

                            <p className="mt-1 text-sm text-[#81766e]">
                                Menüye yeni ürün ekleyin.
                            </p>

                            <div className="mt-6 space-y-5">

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Ürün adı
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            newName
                                        }
                                        onChange={(e) =>
                                            setNewName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Örn. Türk Kahvesi"
                                        className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Kategori
                                    </label>

                                    <select
                                        value={
                                            newCategoryId
                                        }
                                        onChange={(e) =>
                                            setNewCategoryId(
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#ddd4cb] bg-white px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                    >
                                        <option value="">
                                            Kategori seçin
                                        </option>

                                        {categories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Açıklama
                                    </label>

                                    <textarea
                                        value={
                                            newDescription
                                        }
                                        onChange={(e) =>
                                            setNewDescription(
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        placeholder="Ürün açıklaması"
                                        className="w-full resize-none rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Fiyat
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                newPrice
                                            }
                                            onChange={(e) =>
                                                setNewPrice(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="100"
                                            className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 pr-12 text-sm outline-none focus:border-[#292622]"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#81766e]">
                                            ₺
                                        </span>

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
                                    className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium hover:bg-[#f4f0ea]"
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
                                    className="flex-1 rounded-xl bg-[#292622] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {saving
                                        ? "Ekleniyor..."
                                        : "Ürünü Ekle"}
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* ========================= */}
                {/* EDIT MODAL */}
                {/* ========================= */}

                {editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">

                        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">

                            <h2 className="text-xl font-semibold">
                                Ürünü Düzenle
                            </h2>

                            <p className="mt-1 text-sm text-[#81766e]">
                                Menüde görünen ürün bilgilerini güncelleyin.
                            </p>

                            <div className="mt-6 space-y-5">

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Ürün adı
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            name
                                        }
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
                                        Kategori
                                    </label>

                                    <select
                                        value={
                                            categoryId
                                        }
                                        onChange={(e) =>
                                            setCategoryId(
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#ddd4cb] bg-white px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                    >
                                        {categories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Açıklama
                                    </label>

                                    <textarea
                                        value={
                                            description
                                        }
                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm outline-none focus:border-[#292622]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Fiyat
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                price
                                            }
                                            onChange={(e) =>
                                                setPrice(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-[#ddd4cb] px-4 py-3 pr-12 text-sm outline-none focus:border-[#292622]"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#81766e]">
                                            ₺
                                        </span>

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
                                    className="flex-1 rounded-xl border border-[#ddd4cb] px-4 py-3 text-sm font-medium hover:bg-[#f4f0ea]"
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

            </div>
        </>
    );
}