// Curated subset of common SSIC 2020 codes used by Singapore Pte Ltd companies.
// Source: ACRA / Department of Statistics SSIC 2020. This is an abridged list focused on
// codes most frequently selected during incorporation — not the full official catalogue.

export type SsicCode = {
  code: string;
  title: string;
  section: string;
  keywords?: string[];
};

export const ssicCodes: SsicCode[] = [
  // Agriculture & Food
  { code: "01300", title: "Growing of vegetables, ornamental plants and nursery products", section: "Agriculture" },
  { code: "10712", title: "Manufacture of cakes, pastries and other bakers' wares", section: "Manufacturing", keywords: ["bakery", "cafe"] },
  { code: "10791", title: "Manufacture of coffee, including coffee mixes", section: "Manufacturing", keywords: ["coffee roaster"] },
  // Construction & Trades
  { code: "41001", title: "Construction of residential buildings", section: "Construction" },
  { code: "41002", title: "Construction of non-residential buildings", section: "Construction" },
  { code: "43210", title: "Electrical works", section: "Construction", keywords: ["electrician"] },
  { code: "43221", title: "Plumbing and sanitary works", section: "Construction" },
  { code: "43301", title: "Painting", section: "Construction" },
  { code: "43302", title: "Floor and wall covering (including tiling)", section: "Construction" },
  { code: "43909", title: "Other specialised construction n.e.c.", section: "Construction", keywords: ["renovation contractor"] },
  // Wholesale & Retail
  { code: "46900", title: "Wholesale trade of a variety of goods without a dominant product", section: "Wholesale trade", keywords: ["general wholesaler", "trading", "trader"] },
  { code: "47199", title: "Retail sale in non-specialised stores n.e.c.", section: "Retail" },
  { code: "47411", title: "Retail sale of computer hardware (except mobile phones)", section: "Retail" },
  { code: "47413", title: "Retail sale of mobile phones", section: "Retail" },
  { code: "47711", title: "Retail sale of clothing for adults", section: "Retail", keywords: ["fashion", "apparel"] },
  { code: "47713", title: "Retail sale of footwear", section: "Retail" },
  { code: "47731", title: "Retail sale of cosmetics and toiletries (including beauty supplies)", section: "Retail", keywords: ["cosmetics", "skincare"] },
  { code: "47912", title: "Online retail sale via internet (with own physical store)", section: "Retail", keywords: ["ecommerce", "e-commerce", "online shop"] },
  { code: "47914", title: "Online retail sale via internet (without own physical store)", section: "Retail", keywords: ["ecommerce", "e-commerce", "dropshipping", "shopify"] },
  // Transportation
  { code: "49230", title: "Freight transport by road", section: "Transport", keywords: ["logistics", "trucking"] },
  { code: "52299", title: "Other transportation support activities n.e.c.", section: "Transport", keywords: ["freight forwarder", "logistics"] },
  // Accommodation & F&B
  { code: "55101", title: "Hotels with restaurant", section: "Hospitality" },
  { code: "56111", title: "Restaurants", section: "F&B" },
  { code: "56112", title: "Cafes and coffee houses", section: "F&B", keywords: ["cafe", "coffee shop"] },
  { code: "56121", title: "Fast food outlets", section: "F&B" },
  { code: "56210", title: "Event catering", section: "F&B", keywords: ["caterer"] },
  { code: "56301", title: "Pubs", section: "F&B", keywords: ["bar"] },
  // Information & Communication
  { code: "58201", title: "Publishing of software (except games)", section: "ICT", keywords: ["software publisher", "saas"] },
  { code: "58202", title: "Publishing of games software", section: "ICT", keywords: ["game studio", "gaming"] },
  { code: "59112", title: "Production of videos", section: "Media", keywords: ["videographer", "video production"] },
  { code: "60100", title: "Radio broadcasting", section: "Media", keywords: ["podcast"] },
  { code: "62011", title: "Development of e-commerce applications", section: "ICT", keywords: ["software developer", "web development", "app development"] },
  { code: "62012", title: "Development of other software and programming activities n.e.c.", section: "ICT", keywords: ["software house", "saas", "tech startup", "app development"] },
  { code: "62021", title: "IT consultancy (except cybersecurity)", section: "ICT", keywords: ["it consultant"] },
  { code: "62022", title: "Cybersecurity consultancy", section: "ICT" },
  { code: "62090", title: "Other information technology and computer service activities n.e.c.", section: "ICT", keywords: ["it services"] },
  { code: "63111", title: "Data processing, hosting and related activities", section: "ICT", keywords: ["data center", "hosting"] },
  { code: "63120", title: "Web portals (e.g. operation of sites that use a search engine)", section: "ICT", keywords: ["website", "online platform"] },
  // Financial & Insurance
  { code: "64202", title: "Investment holding companies", section: "Finance", keywords: ["holding company", "investment vehicle"] },
  { code: "64301", title: "Hedge funds", section: "Finance" },
  { code: "64302", title: "Venture capital and private equity funds", section: "Finance", keywords: ["vc", "private equity"] },
  { code: "66120", title: "Securities brokerage and other related activities", section: "Finance" },
  { code: "66301", title: "Fund management activities (with CMS licence)", section: "Finance", keywords: ["fund manager", "asset management"] },
  { code: "66302", title: "REIT management activities", section: "Finance" },
  // Real estate
  { code: "68101", title: "Real estate developers", section: "Real estate", keywords: ["property developer"] },
  { code: "68201", title: "Real estate agencies and valuation services", section: "Real estate", keywords: ["property agent"] },
  { code: "68209", title: "Other real estate activities on a fee or contract basis", section: "Real estate" },
  // Professional services
  { code: "69100", title: "Legal activities", section: "Professional services", keywords: ["law firm", "lawyer"] },
  { code: "69201", title: "Accounting and auditing services", section: "Professional services", keywords: ["accountant", "auditor"] },
  { code: "69202", title: "Bookkeeping services", section: "Professional services", keywords: ["bookkeeper"] },
  { code: "69203", title: "Tax consultancy", section: "Professional services", keywords: ["tax consultant"] },
  { code: "70201", title: "Business and management consultancy services", section: "Professional services", keywords: ["consultant", "consulting"] },
  { code: "70202", title: "Public relations consultancy services", section: "Professional services", keywords: ["pr"] },
  { code: "71101", title: "Architectural services", section: "Professional services", keywords: ["architect"] },
  { code: "71102", title: "Engineering services", section: "Professional services", keywords: ["engineer"] },
  { code: "71121", title: "Surveying activities", section: "Professional services" },
  { code: "73100", title: "Advertising", section: "Professional services", keywords: ["agency", "marketing agency", "advertising agency"] },
  { code: "73200", title: "Market research and public opinion polling", section: "Professional services" },
  { code: "74101", title: "Specialised design activities (e.g. interior, industrial, graphic design)", section: "Professional services", keywords: ["designer", "graphic designer", "interior designer", "ui ux"] },
  { code: "74201", title: "Photographic studios", section: "Professional services", keywords: ["photographer"] },
  { code: "74909", title: "Other professional, scientific and technical activities n.e.c.", section: "Professional services", keywords: ["freelancer", "consultant"] },
  // Admin & support
  { code: "78101", title: "Employment agencies (excluding maid agencies)", section: "Admin & support", keywords: ["recruitment", "headhunter"] },
  { code: "79110", title: "Travel agencies", section: "Travel" },
  { code: "82110", title: "Office administrative and support service activities", section: "Admin & support", keywords: ["virtual assistant", "back office"] },
  { code: "82301", title: "Convention and trade show organisers", section: "Admin & support", keywords: ["event organizer", "events"] },
  // Education
  { code: "85410", title: "Tertiary education n.e.c.", section: "Education" },
  { code: "85492", title: "Educational support services (e.g. tutoring)", section: "Education", keywords: ["tuition", "tutor", "enrichment"] },
  // Health
  { code: "86201", title: "General medical services (clinics)", section: "Healthcare", keywords: ["gp", "clinic"] },
  { code: "86203", title: "Specialised medical services (e.g. dentistry, dermatology)", section: "Healthcare" },
  { code: "86901", title: "Physiotherapy practice", section: "Healthcare" },
  { code: "86902", title: "Traditional Chinese medicine (TCM) practice", section: "Healthcare", keywords: ["tcm"] },
  // Arts & recreation
  { code: "93120", title: "Activities of sports clubs", section: "Arts & recreation", keywords: ["gym", "fitness"] },
  { code: "93201", title: "Amusement and recreation activities n.e.c.", section: "Arts & recreation" },
  { code: "96021", title: "Hairdressing salons (including barber shops)", section: "Personal services", keywords: ["salon", "barber"] },
  { code: "96022", title: "Beauty salons", section: "Personal services", keywords: ["spa", "nails"] },
  // Crypto / fintech popular
  { code: "66199", title: "Other activities auxiliary to financial service activities n.e.c.", section: "Finance", keywords: ["fintech", "payments", "crypto", "digital assets"] },
  { code: "64999", title: "Other financial service activities n.e.c.", section: "Finance", keywords: ["fintech", "lending", "p2p"] },
];

export function searchSsic(query: string): SsicCode[] {
  const q = query.trim().toLowerCase();
  if (!q) return ssicCodes;
  return ssicCodes.filter((c) => {
    if (c.code.includes(q)) return true;
    if (c.title.toLowerCase().includes(q)) return true;
    if (c.section.toLowerCase().includes(q)) return true;
    if (c.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
    return false;
  });
}
