/**
 * Seed script — inserts dummy reports into Supabase.
 * Usage:  npx -y tsx --env-file=.env.local scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL in .env.local first");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_REPORTS = [
    {
        location_lat: 27.7172, location_lng: 85.324, district: "Kathmandu", ward_number: 16,
        ipfs_cid: "QmPkR2L5d8hFGo8q7iFbnCJgiMvehA2jB5oZg8LC2r6T",
        upvotes: 205, is_petition: true,
        reporter: "7Ytt3kLgPkCvxWg3N6pRmz7k2gH1bFx8kFpCadzGkP",
        category: "roads", status: "petition",
        title: "Massive pothole on Ring Road near Kalanki — multiple accidents reported",
        description: "The pothole has been growing for months near the Kalanki intersection. Motorcycles and smaller vehicles are at extreme risk, especially at night when visibility is poor.",
        image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.7085, location_lng: 85.3188, district: "Kathmandu", ward_number: 4,
        ipfs_cid: "QmRkT2L5d8hFGo8q7iFbnCJgiMvehA2jB5oZg8LC3s7U",
        upvotes: 178, is_petition: true,
        reporter: "CoX3bJ8xLsVHfKPQ2dJcHmN5rP9vBx4kFpCadzPv5A",
        category: "corruption", status: "petition",
        title: "Ward office demanding illegal fees for citizenship certificates",
        description: "People are being asked to pay Rs 2000-5000 under the table for citizenship certificate processing that should be free.",
        image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
    },
    {
        location_lat: 28.2096, location_lng: 83.9856, district: "Kaski", ward_number: 17,
        ipfs_cid: "QmUnW5O8g1kIr1t0lIeeFMliPxhiD5mE8rCj1OF6v0X",
        upvotes: 147, is_petition: true,
        reporter: "9FgH2kLmPnCvxWg3N6pQrz7k2gH1bFx8kFpCadzRt3",
        category: "utilities", status: "petition",
        title: "Illegal factory dumping waste into Seti River — broken water pipes flooding streets",
        description: "Chemical waste from an unregistered factory is leaking through broken municipal pipes into the Seti River.",
        image_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop",
    },
    {
        location_lat: 26.6682, location_lng: 87.2836, district: "Morang", ward_number: 11,
        ipfs_cid: "QmSlU3M6e9iGHp9r8jGcnDKjhNwfhB3kC6pAh9MD4t8V",
        upvotes: 132, is_petition: true,
        reporter: "5BnM7rLkPxCvyWh4O7qStz8l3hI2cGy9lGqDbezSu4",
        category: "scam", status: "petition",
        title: "Fake employment agency scamming migrant workers near bus park",
        description: "An office near the Biratnagar bus park is collecting Rs 50,000-100,000 from workers promising Gulf jobs.",
        image_url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.672, location_lng: 85.4298, district: "Bhaktapur", ward_number: 8,
        ipfs_cid: "QmTmV4N7f0jIHq0s9kHdoELkhOxgiC4lD7qBi0NE5u9W",
        upvotes: 91, is_petition: false,
        reporter: "4AmL6qKjOwBuxVg3N6pRsy7j2fH0aEw8jFoCcbyRt3",
        category: "hazards", status: "active",
        title: "Collapsed retaining wall blocking Arniko Highway — landslide risk",
        description: "Heavy rainfall caused a 30-meter retaining wall to collapse on the highway. Only one lane is passable.",
        image_url: "https://images.unsplash.com/photo-1582407947092-50b8c1a4f3e8?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.6588, location_lng: 84.4364, district: "Chitwan", ward_number: 5,
        ipfs_cid: "QmVoX6P9h2lJs2u1mJfgGNmjQyiF6nFs9sDk2PG7w1Y",
        upvotes: 87, is_petition: false,
        reporter: "3ZlK5pJiNvAtxUf2M5oQrx6i1eG9zDv7iEnBbaXqS2",
        category: "utilities", status: "active",
        title: "Open waste burning site — uncollected garbage near residential area in Bharatpur",
        description: "Municipality is burning uncollected waste in an open field adjacent to a school. Thick smoke visible daily.",
        image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.6769, location_lng: 85.3157, district: "Lalitpur", ward_number: 12,
        ipfs_cid: "QmWpY7Q0i3mKt3v2nKgeHOnkRzjG7oGt0eFl3QH8x2Z",
        upvotes: 64, is_petition: false,
        reporter: "2YkJ4oIhMuZswTe1L4nPqw5h0dF8yCu6hDmAaZWpR1",
        category: "roads", status: "active",
        title: "Crater-sized potholes on Satdobato-Godawari road",
        description: "Multiple deep potholes along the main road to Godawari. At least 3 motorcycle accidents this week.",
        image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.5831, location_lng: 83.5444, district: "Rupandehi", ward_number: 2,
        ipfs_cid: "QmXqZ8R1j4nLu4w3oLhfIPomSzkH8pHu1gGm4RI9y3A",
        upvotes: 42, is_petition: false,
        reporter: "6DfE0mGfKsXquRc9J2lNot3f8bD6wAs4fBkyYXUnP9",
        category: "roads", status: "active",
        title: "Broken bridge on Siddhartha Highway poses danger to commuters",
        description: "The steel railing and concrete surface of the bridge are severely damaged. Heavy vehicles still crossing.",
        image_url: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
    },
    {
        location_lat: 27.6205, location_lng: 85.5392, district: "Kavrepalanchok", ward_number: 9,
        ipfs_cid: "QmYrA9S2k5oMv5x4pMigJQnlTziI9qIv2hHn5SJ0z4B",
        upvotes: 34, is_petition: false,
        reporter: "1CeD9lFeLrWptQb8I1kMns2e7aC5vZr3eAjxXWTmO8",
        category: "corruption", status: "active",
        title: "Land registration office demanding bribes for document processing",
        description: "Officers at the malpot office are openly asking for Rs 5000-10000 to process land registration papers.",
        image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
    },
    {
        location_lat: 28.2024, location_lng: 81.6271, district: "Banke", ward_number: 14,
        ipfs_cid: "QmZsB0T3l6pNw6y5qNjhKRomUzkJ0rJw3iIo6TK1a5C",
        upvotes: 23, is_petition: false,
        reporter: "0BdC8kEdKqVosPA7H0jLmr1d6zB4uYq2dZiwWVSlN7",
        category: "scam", status: "active",
        title: "Counterfeit medicine being sold at unlicensed clinic",
        description: "A clinic operating without a valid license is selling expired and counterfeit medicines to patients.",
        image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    },
    {
        location_lat: 29.2953, location_lng: 80.588, district: "Darchula", ward_number: 3,
        ipfs_cid: "QmAtC1U4m7qOx7z6rOkhLSqnVakK1sKx4jJp7UK2b6D",
        upvotes: 15, is_petition: false,
        reporter: "ZAcB7jDcJpUnnOz6G9iKlq0c5yA3tXp1cYhvVUrkM6",
        category: "hazards", status: "active",
        title: "Flood embankment construction stalled — flooding risk as monsoon approaches",
        description: "Construction of the flood embankment was halted 6 months ago at 40% completion. The contractor has disappeared.",
        image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop",
    },
];

async function seed() {
    console.log("🌱 Seeding reports into Supabase...\n");

    // Clear existing reports
    const { error: delErr } = await supabase
        .from("reports")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
        console.error("❌ Failed to clear:", delErr.message);
        process.exit(1);
    }

    const { data, error } = await supabase
        .from("reports")
        .insert(SEED_REPORTS)
        .select();

    if (error) {
        console.error("❌ Seed failed:", error.message);
        process.exit(1);
    }

    console.log(`✅ Seeded ${data.length} reports successfully!\n`);
    data.forEach((r: any) => console.log(`   📝 ${r.title.slice(0, 60)}... (id: ${r.id})`));
    console.log("\n🎉 Done! Refresh your app to see the seeded data.");
}

seed();
