export interface Product {
  id: string;
  name: string;
  fullName?: string;
  handle?: string;
  description: string;
  fullDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  images?: string[];
  category: 't-shirts' | 'welcome-kits' | 'corporate-gifts' | 'keychains-badges' | 'drinkware' | 'office-essentials' | 'corporate-kits' | string;
  rating: number;
  ratingCount: number;
  isVeg?: boolean;
  isBestseller?: boolean;
  minQty?: number;
  customizations?: Customization[];
  preparationTime?: number;
  calories?: number;
}

export interface Customization {
  id: string;
  name: string;
  extraPrice: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCustomizations: string[];
  totalPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  address: DeliveryAddress;
  paymentMethod: string;
  status: 'placed' | 'preparing' | 'out-for-delivery' | 'delivered';
  itemTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  placedAt: Date;
  estimatedDelivery?: string;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "7974351339696",
    handle: "custom-t-shirt-with-your-company-logo",
    name: "Custom Polo T-Shirts with Company Logo Printing",
    fullName: "Custom Polo T-Shirts with Company Logo Printing | Corporate Uniform Manufacturer India | Graphic Line",
    description: "Premium Customized Polo T-Shirts crafted for corporate uniforms, teams, coaching institutes, events, and brand merchandise. Made with high-quality breathable honeycomb fabric (220 GSM), featuring sharp embroidery or durable HD logo printing in 14 vibrant colors.",
    price: 4950,
    originalPrice: 5940,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphic-line-custom-black-polo-tshirt-printing-india_4a1a005a-fc00-49bd-be62-2d8c82751936.webp?v=1780067759",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphic-line-custom-navy-blue-polo-tshirt-printing-india_2326a8d2-c06a-482b-86e8-34ead93078cc.webp?v=1780067759",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphic-line-custom-black-polo-tshirt-printing-india_4a1a005a-fc00-49bd-be62-2d8c82751936.webp?v=1780067759",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphic-line-custom-navy-blue-polo-tshirt-printing-india_2326a8d2-c06a-482b-86e8-34ead93078cc.webp?v=1780067759",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphic-line-custom-royal-blue-polo-tshirt-printing-india_032bb027-b8e1-41cb-a2c4-4aa0eda2d179.webp?v=1780067759"
    ],
    category: "t-shirts",
    rating: 4.9,
    ratingCount: 312,
    isVeg: true,
    isBestseller: true,
    minQty: 10,
    customizations: [
      { id: "c1", name: "Front Chest Logo Embroidery", extraPrice: 0 },
      { id: "c2", name: "Back Text/Logo Printing", extraPrice: 50 },
      { id: "c3", name: "Sleeve Logo Branding", extraPrice: 35 }
    ]
  },
  {
    id: "7974127566896",
    handle: "personalized-diary-with-pen-set-graphicline-in",
    name: "Executive Diary & Pen Gift Set",
    fullName: "Executive Diary & Pen Gift Set | GRAPHICLINE.IN",
    description: "Premium corporate notebook diary paired with an engraved metal pen in a luxury presentation box. Ideal for employee onboarding, corporate gifting, and annual events.",
    price: 1190,
    originalPrice: 1380,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-diary-and-pen-set_webp.webp?v=1779789968",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-diary-pen-set_webp.webp?v=1779789968",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-diary-and-pen-set_webp.webp?v=1779789968",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-diary-pen-set_webp.webp?v=1779789968",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-customized-corporate-notebook_webp.webp?v=1779789968"
    ],
    category: "corporate-gifts",
    rating: 4.9,
    ratingCount: 184,
    isVeg: true,
    isBestseller: false,
    minQty: 1,
    customizations: [
      { id: "c1", name: "Custom Name & Logo Embossing", extraPrice: 0 },
      { id: "c2", name: "Luxury Ribbon Gift Wrap", extraPrice: 60 }
    ]
  },
  {
    id: "7971976249392",
    handle: "premium-corporate-notebook-graphicline-in",
    name: "Premium Corporate Notebook",
    fullName: "Premium Corporate Notebook | GRAPHICLINE.IN",
    description: "Professional leatherette bound notebook with elastic band, bookmark ribbon, and pen holder loop. Features smooth non-bleed 80 GSM paper and crisp debossed or UV logo.",
    price: 990,
    originalPrice: 1138,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-black-premium-corporate-notebook-custom-logo_webp.webp?v=1779790395",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-black-premium-corporate-notebook-custom-logo.1webp.webp?v=1779790395",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-black-premium-corporate-notebook-custom-logo_webp.webp?v=1779790395",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-black-premium-corporate-notebook-custom-logo.1webp.webp?v=1779790395",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-corporate-notebook-custom-logo_webp.webp?v=1779790395"
    ],
    category: "corporate-gifts",
    rating: 4.8,
    ratingCount: 142,
    isVeg: true,
    isBestseller: false,
    minQty: 1
  },
  {
    id: "7971856089136",
    handle: "premium-vacuum-flask-set-graphicline-in",
    name: "Luxury Vacuum Flask Gift Set",
    fullName: "Luxury Vacuum Flask Gift Set | Graphicline.in",
    description: "Double-walled stainless steel insulated 500ml vacuum bottle with 3 drinking cups in an elegant matte finish gift box. Keeps beverages hot or cold for up to 24 hours.",
    price: 1599,
    originalPrice: 1838,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-vacuum-flask-set_webp.webp?v=1779790589",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-vacuum-flask-coffee-mug-set_webp.webp?v=1779790523",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-vacuum-flask-set_webp.webp?v=1779790589",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-vacuum-flask-coffee-mug-set_webp.webp?v=1779790523",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-vacuum-flask-gift-set_webp.webp?v=1779790589"
    ],
    category: "drinkware",
    rating: 4.9,
    ratingCount: 220,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  {
    id: "7971071164464",
    handle: "premium-personalized-mouse-pads-graphicline-in",
    name: "Custom Branding Mouse Pad",
    fullName: "Custom Branding Mouse Pad | Graphicline.in",
    description: "Anti-slip rubber base desktop mouse pad with high-definition edge-to-edge sublimation branding. Water-resistant smooth glide surface suitable for everyday office and gaming use.",
    price: 1150,
    originalPrice: 1322,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-mouse-pad-design-2_webp.webp?v=1779790856",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-mouse-pad-design-1_webp.webp?v=1779790856",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-mouse-pad-design-2_webp.webp?v=1779790856",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-mouse-pad-design-1_webp.webp?v=1779790856",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-mouse-pad-design_webp.webp?v=1779790856"
    ],
    category: "office-essentials",
    rating: 4.7,
    ratingCount: 98,
    isVeg: true,
    isBestseller: false,
    minQty: 5
  },
  {
    id: "7971068313648",
    handle: "promotional-key-chain-sublimation-graphicline-in",
    name: "Custom Sublimation Keychain",
    fullName: "Custom Sublimation Keychain | Graphicline.in",
    description: "Durable high-gloss metal sublimation keychains with full-color logo printing on both sides. Heavy-duty key ring with scratch-proof resin dome coat.",
    price: 2990,
    originalPrice: 3438,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-customized-promotional-keychain_webp.webp?v=1779791226",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-promotional-square-keychain_webp.webp?v=1779791226",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-customized-promotional-keychain_webp.webp?v=1779791226",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-promotional-square-keychain_webp.webp?v=1779791226",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-promotional-rectangle-keychain_webp.webp?v=1779791226"
    ],
    category: "keychains-badges",
    rating: 4.8,
    ratingCount: 165,
    isVeg: true,
    isBestseller: false,
    minQty: 10
  },
  {
    id: "7970136686640",
    handle: "premium-custom-logo-card-holder-graphicline-in",
    name: "Premium Metal Visiting Card Holder",
    fullName: "Premium Metal Visiting Card Holder | Graphicline.in",
    description: "Sleek stainless steel & premium PU leather visiting card case with magnetic snap clasp. Fits up to 25 business cards with laser-etched metallic corporate logo.",
    price: 699,
    originalPrice: 805,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-card-holder-black-leather_webp.webp?v=1779792013",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-card-holder-black-leather_webp.webp?v=1779792013",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-card-holder-black-leather_webp.webp?v=1779792013"
    ],
    category: "office-essentials",
    rating: 4.9,
    ratingCount: 278,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  {
    id: "7970118008880",
    handle: "luxury-branding-pen-keychain-gift-set-graphicline-in",
    name: "Executive Pen & Keychain Gift Box",
    fullName: "Executive Pen & Keychain Gift Box | Graphicline.in",
    description: "Matching metallic roller pen and leather keychain combo packed in a sleek magnetic gift box. The classic corporate giveaway for client appreciation and exhibitions.",
    price: 799,
    originalPrice: 969,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-luxury-executive-pen-keychain-gift-box-2_webp.webp?v=1779792510",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-smart-touch-executive-pen_webp.webp?v=1779792510",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-luxury-executive-pen-keychain-gift-box-2_webp.webp?v=1779792510",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-smart-touch-executive-pen_webp.webp?v=1779792510",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-executive-pen-keychain-combo_webp.webp?v=1779792510"
    ],
    category: "welcome-kits",
    rating: 4.8,
    ratingCount: 195,
    isVeg: true,
    isBestseller: false,
    minQty: 1
  },
  {
    id: "7968277102640",
    handle: "premium-elite-business-gift-set-card-holder-pen-keychain-combo-graphicline-in",
    name: "Premium Elite Business Gift Set – Card Holder, Pen & Keychain Combo",
    fullName: "Premium Elite Business Gift Set – Card Holder, Pen & Keychain Combo | Graphicline.in",
    description: "The complete 3-in-1 corporate kit: Visiting card case, precision-balanced metal ballpoint pen, and heavy metal keychain all engraved with company branding in luxury foam insert packaging.",
    price: 999,
    originalPrice: 1199,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-elite-business-gift-set_webp.webp?v=1779793338",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-card-holder_webp_70cfd0c0-fc5b-47b3-b99c-967e7f9dcf6d.webp?v=1779793337",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-elite-business-gift-set_webp.webp?v=1779793338",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-card-holder_webp_70cfd0c0-fc5b-47b3-b99c-967e7f9dcf6d.webp?v=1779793337",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-business-gift-set_webp.webp?v=1779793361"
    ],
    category: "welcome-kits",
    rating: 5.0,
    ratingCount: 340,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  {
    id: "7968245252144",
    handle: "3-in-1-corporate-gift-set-bottle-pen-keychain-graphicline-in",
    name: "Bottle, Pen & Keychain Welcome Kit",
    fullName: "Bottle, Pen & Keychain Welcome Kit | Graphicline.in",
    description: "500ml stainless steel temperature bottle, stylus touch metal pen, and premium metal keychain customized with your brand logo in a luxury matte black gift box.",
    price: 1799,
    originalPrice: 2149,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-gift-set-bottle-pen-keychain-2_webp.webp?v=1779793943",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-stainless-steel-sports-water-bottle-500ml_webp.webp?v=1779793943",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-gift-set-bottle-pen-keychain-2_webp.webp?v=1779793943",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-stainless-steel-sports-water-bottle-500ml_webp.webp?v=1779793943",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-smart-look-executive-gift-set_webp.webp?v=1779793943"
    ],
    category: "welcome-kits",
    rating: 4.9,
    ratingCount: 210,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  // {
  //   id: "7967812976688",
  //   handle: "premium-custom-logo-water-bottles-collection",
  //   name: "Premium Custom Logo Water Bottles Collection",
  //   fullName: "Premium Custom Logo Water Bottles Collection",
  //   description: "Insulated stainless steel sports and executive water bottles with laser engraving or permanent UV print. Available in Matte Black, Silver, Rose Gold, and Navy Blue.",
  //   price: 899,
  //   originalPrice: 1099,
  //   image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-engraved-water-bottle-collection_webp.webp?v=1779795052",
  //   secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-engraved-water-bottle-collection_webp.webp?v=1779795052",
  //   images: [
  //     "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-engraved-water-bottle-collection_webp.webp?v=1779795052"
  //   ],
  //   category: "drinkware",
  //   rating: 4.8,
  //   ratingCount: 155,
  //   isVeg: true,
  //   isBestseller: false,
  //   minQty: 1
  // },
  {
    id: "7967735349296",
    handle: "premium-mobile-stand-with-branding-graphicline-in",
    name: "Premium Mobile Stand with Branding",
    fullName: "Premium Mobile Stand with Branding | Graphicline.in",
    description: "Ergonomic aluminum metal desktop mobile phone and tablet holder with cable cutout and anti-skid silicone pads. Custom laser logo engraving on front face.",
    price: 599,
    originalPrice: 699,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-branding-mobile-stand_webp.webp?v=1779795751",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-logo-mobile-stand_webp.webp?v=1779795751",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-branding-mobile-stand_webp.webp?v=1779795751",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-logo-mobile-stand_webp.webp?v=1779795751",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-phone-holder-branding_webp.webp?v=1779795751"
    ],
    category: "office-essentials",
    rating: 4.9,
    ratingCount: 198,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  // {
  //   id: "7966779408432",
  //   handle: "corporate-diary-gift-kit-diary-pen-keychain-graphicline-in",
  //   name: "Corporate Diary Gift Kit | Diary + Pen + Keychain",
  //   fullName: "Corporate Diary Gift Kit | Diary+Pen+Keychain | Graphicline.in",
  //   description: "The quintessential 3-piece corporate gift set: A5 hardbound organizer diary, heavy metal executive pen, and matching keychain delivered in a padded presentation box.",
  //   price: 1499,
  //   originalPrice: 1799,
  //   image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-welcome-kit-diary-pen-bottle-keychain-1_webp.webp?v=1779796030",
  //   secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-welcome-kit-diary-pen-bottle-keychain_webp.webp?v=1779796030",
  //   images: [
  //     "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-welcome-kit-diary-pen-bottle-keychain-1_webp.webp?v=1779796030",
  //     "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-corporate-welcome-kit-diary-pen-bottle-keychain_webp.webp?v=1779796030",
  //     "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-branded-welcome-box_webp.webp?v=1779796030"
  //   ],
  //   category: "welcome-kits",
  //   rating: 4.9,
  //   ratingCount: 275,
  //   isVeg: true,
  //   isBestseller: true,
  //   minQty: 1
  // },
  {
    id: "7966763483184",
    handle: "custom-metal-keychains-for-branding-graphicline-in",
    name: "Custom Metal Keychains for Branding",
    fullName: "Custom Metal Keychains for Branding | Graphicline.in",
    description: "Heavy zinc alloy keychains with razor-sharp laser logo engraving on polished chrome finish. Will never rust or fade. Perfect high-volume promotional giveaway.",
    price: 599,
    originalPrice: 699,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-engraved-rectangle-metal-keychain_png.png?v=1779796281",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-engraved-metal-keychains_png.png?v=1779796281",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-engraved-rectangle-metal-keychain_png.png?v=1779796281",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-custom-engraved-metal-keychains_png.png?v=1779796281",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-engraved-circle-metal-keychain_png.png?v=1779796281"
    ],
    category: "keychains-badges",
    rating: 4.8,
    ratingCount: 310,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  {
    id: "7966746968112",
    handle: "engraved-metal-pens-for-professional-branding-graphicline-in",
    name: "Engraved Metal Pens for Professional Branding",
    fullName: "Engraved Metal Pens for Professional Branding | Graphicline.in",
    description: "Precision metal rollerball & stylus pens featuring crisp laser engraving. Smooth German blue ink, weighted solid grip, and slider presentation gift box.",
    price: 399,
    originalPrice: 458,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-corporate-pen-collection_webp.webp?v=1779796661",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-smart-touch-pen-with-slider-box_webp.webp?v=1779796631",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-premium-corporate-pen-collection_webp.webp?v=1779796661",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-smart-touch-pen-with-slider-box_webp.webp?v=1779796631",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-silver-pro-premium-pen-with-slider-box_webp.webp?v=1779796631",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-matte-black-classic-pen-with-slider-box_webp.webp?v=1779796631"
    ],
    category: "corporate-gifts",
    rating: 4.9,
    ratingCount: 420,
    isVeg: true,
    isBestseller: true,
    minQty: 1
  },
  {
    id: "7950569209904",
    handle: "customized-magnetic-badge-wear-your-brand",
    name: "Custom Magnetic Name Badge for Professionals",
    fullName: "Custom Magnetic Name Badge for Professionals",
    description: "Premium magnetic name badges with strong dual-magnet back support that will not damage clothes or leave pin holes. Customized with employee name, logo, and title.",
    price: 790,
    originalPrice: 1023,
    image: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-square-magnetic-name-badges-black-matt_webp.png?v=1779797719",
    secondaryImage: "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-square-magnetic-name-badge-45x45mm_webp.png?v=1779797718",
    images: [
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-square-magnetic-name-badges-black-matt_webp.png?v=1779797719",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-square-magnetic-name-badge-45x45mm_webp.png?v=1779797718",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-rectangular-magnetic-name-badges-black-matt_webp.png?v=1779797719",
      "https://cdn.shopify.com/s/files/1/0681/7257/8864/files/graphicline-rectangle-magnetic-name-badge-60x25mm_webp.png?v=1779797719"
    ],
    category: "keychains-badges",
    rating: 4.8,
    ratingCount: 176,
    isVeg: true,
    isBestseller: false,
    minQty: 1
  }
];
