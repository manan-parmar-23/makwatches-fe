import Image from "next/image";
import Link from "next/link";

const COLORS = {
  primary: "#531A1A",
  primaryLight: "#A45A5A",
  surface: "#FFFFFF",
  text: "#2D1B1B",
  textMuted: "#7C5C5C",
  badgeBg: "#fff",
  badgeBorder: "#531A1A",
  progressBg: "#E5E5E5",
  progressActive: "#531A1A",
};

// Carousel product data
export const PRODUCTS = [
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt1.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt2.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
  {
    id: undefined,
    name: "Black-blue T-shirt for women",
    price: "1799/-",
    image: "/tshirt3.png",
    subcategory: null,
  },
];

export default function ProductCard({
  product,
}: {
  product: (typeof PRODUCTS)[0];
}) {
  const content = (
    <div
      className="flex flex-col items-center px-4 md:px-8"
      style={{
        // fixed card width to match default products and avoid variable calc
        minWidth: "340px",
        maxWidth: "340px",
        flexShrink: 0,
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        scrollSnapAlign: "start",
      }}
    >
      <div className="relative flex flex-col items-center group w-full">
        <div
          className="absolute top-2 left-2 px-5 py-2 rounded-full border text-base font-semibold z-10 bg-white"
          style={{
            border: `1.5px solid ${COLORS.badgeBorder}`,
            color: COLORS.primary,
            boxShadow: "0 1px 4px #531A1A10",
            whiteSpace: "nowrap",
          }}
        >
          {product.price}
        </div>
        <Image
          src={product.image}
          alt={product.name}
          width={320}
          height={320}
          className="mt-8 mb-4 w-[320px] h-[320px] object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ display: "block", background: "none", border: "none" }}
        />
      </div>
      <div
        className="mt-4 text-center font-medium w-full"
        style={{
          color: COLORS.text,
          fontSize: "1.15rem",
          letterSpacing: "0.01em",
        }}
      >
        {product.name}
      </div>
    </div>
  );
  return product.id ? (
    <Link href={`/product_details?id=${product.id}`}>{content}</Link>
  ) : (
    content
  );
}
