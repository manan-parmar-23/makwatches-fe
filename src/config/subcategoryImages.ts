// Curated image map for subcategories using Unsplash images.
// Keys are lowercased subcategory names. Values are stable Unsplash image URLs.

const MAP: Record<string, string> = {
  // Women's clothing
  saree: "https://source.unsplash.com/qu3PiGtdVpY/800x800", // Traditional saree
  kurta: "https://source.unsplash.com/c3S7ldKvk74/800x800", // Women's kurta
  kurti: "https://source.unsplash.com/msb6Kx80qCw/800x800", // Casual kurti
  lehenga: "https://source.unsplash.com/a7G01aCJQWY/800x800", // Wedding lehenga
  dress: "https://source.unsplash.com/orVLbwZ8_TA/800x800", // Fashion dress
  blouse: "https://source.unsplash.com/RMQG7yOQCb8/800x800", // Women's blouse
  dupatta: "https://source.unsplash.com/SJxlPMLTO8Y/800x800", // Colorful dupatta
  skirt: "https://source.unsplash.com/mJZs1bJRM1o/800x800", // Stylish skirt

  // Men's clothing
  jeans: "https://source.unsplash.com/laNNTAth9JU/800x800", // Men's jeans
  shirt: "https://source.unsplash.com/DnCQB40Gu8g/800x800", // Formal shirt
  tshirt: "https://source.unsplash.com/VJ4pn_PSBLo/800x800", // Casual t-shirt
  trouser: "https://source.unsplash.com/JZt0ES4J2HE/800x800", // Formal trousers
  jacket: "https://source.unsplash.com/HPI6U4KtT_0/800x800", // Stylish jacket
  coat: "https://source.unsplash.com/wYSKkIE7Y2k/800x800", // Winter coat
  suit: "https://source.unsplash.com/h5cd51KXmRQ/800x800", // Business suit
  sherwani: "https://source.unsplash.com/JXI2A8erS-Y/800x800", // Traditional sherwani

  // Footwear
  shoes: "https://source.unsplash.com/QFc2kxpM5Lc/800x800", // Men's shoes
  sneakers: "https://source.unsplash.com/COWz1Js1nAU/800x800", // Stylish sneakers
  heels: "https://source.unsplash.com/RqMIJprV2PI/800x800", // Women's heels

  // Additional categories
  top: "https://source.unsplash.com/zDyJOj8ZXG0/800x800", // Women's top
  ethnic: "https://source.unsplash.com/r2_mvSCLn8g/800x800", // Ethnic wear
  casual: "https://source.unsplash.com/hwc7eIQiTCE/800x800", // Casual wear
  formal: "https://source.unsplash.com/YEGgw9JSIx4/800x800", // Formal wear
  traditional: "https://source.unsplash.com/78A265wPiO4/800x800", // Traditional wear
};

export function getImageForSubcategory(name?: string | null) {
  if (!name) return null;
  // normalize by trimming, lowercasing and removing non-alphanumeric chars
  const key = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return MAP[key] ?? null;
}
