interface ProductCardProps {
    name: string;
    description: string;
    price: string;
}

export default function ProductCard({
    name,
    description,
    price,
}: ProductCardProps) {
    return (
        <article className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3dbd2] bg-white p-5 shadow-sm">
            <div>
                <h3 className="text-base font-semibold">
                    {name}
                </h3>

                <p className="mt-1 text-sm leading-5 text-[#81766e]">
                    {description}
                </p>
            </div>

            <span className="shrink-0 text-base font-semibold">
                {price}
            </span>
        </article>
    );
}