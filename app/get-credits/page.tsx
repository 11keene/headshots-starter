"use client";

import { useState } from "react";

interface Product {
  id: string;
  amount: number;
  label: string;
  description: string;
}

interface StripePricingTableProps {
  user: any; // Replace with a more specific type if you have one
  products: Product[];
}

export default function StripePricingTable({ user, products }: StripePricingTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, priceId: string) => {
    event.preventDefault();
    setLoading(priceId);
    event.currentTarget.submit();
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col justify-between border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-all duration-300"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.label}</h2>
            <p className="text-gray-600 text-sm mb-6">{product.description}</p>
          </div>
          <form action="/api/stripe/checkout" method="POST" onSubmit={(e) => handleSubmit(e, product.id)}>
            <input type="hidden" name="price_id" value={product.id} />
            <button
              type="submit"
              disabled={loading === product.id}
              className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-900 transition"
            >
              {loading === product.id ? "Processing..." : `Buy for $${product.amount}`}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}