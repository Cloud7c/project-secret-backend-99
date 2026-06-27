// seed-data.js — Create realistic test accounts and listings
// Images are compressed through Sharp (same algorithm as production)
import pool from './src/db.js';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const AGRI_DIR = path.join(PUBLIC_DIR, 'agriculture');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ═══════════════════════════════════════════════
// COMPRESS IMAGE — Same algorithm as createListing
// ═══════════════════════════════════════════════
async function compressImage(sourcePath) {
    const filename = `${crypto.randomUUID()}.webp`;
    const destPath = path.join(UPLOADS_DIR, filename);
    
    try {
        await sharp(sourcePath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(destPath);
        
        const originalSize = fs.statSync(sourcePath).size;
        const compressedSize = fs.statSync(destPath).size;
        const saved = Math.round((1 - compressedSize / originalSize) * 100);
        console.log(`   📸 ${path.basename(sourcePath)} → ${filename} (${saved}% smaller)`);
        
        return `/uploads/${filename}`;
    } catch (err) {
        console.error(`   ❌ Failed to compress ${sourcePath}:`, err.message);
        return null;
    }
}

// ═══════════════════════════════════════════════
// TEST ACCOUNTS — Real Zimbabwean names and data
// ═══════════════════════════════════════════════
const testUsers = [
    { full_name: 'Tendai Moyo',       email: 'tendai.moyo@gmail.com',       phone: '+263771234567',  province: 'Harare',          password: 'Password123!', verified: true },
    { full_name: 'Rumbidzai Ncube',    email: 'rumbi.ncube@yahoo.com',       phone: '+263772345678',  province: 'Bulawayo',        password: 'Secure456!',   verified: true },
    { full_name: 'Tapiwa Chitundu',    email: 'tapiwa.c@hotmail.com',        phone: '+263773456789',  province: 'Mashonaland West', password: 'FarmLife789!', verified: true },
    { full_name: 'Nyasha Dube',        email: 'nyasha.dube@gmail.com',       phone: '+263774567890',  province: 'Matabeleland South', password: 'AgriTech21!', verified: false },
    { full_name: 'Chiedza Makoni',     email: 'chiedza.m@outlook.com',       phone: '+263775678901',  province: 'Manicaland',      password: 'Harvest99!',   verified: false },
    { full_name: 'Blessing Mutasa',    email: 'blessing.mutasa@gmail.com',   phone: '+263776789012',  province: 'Masvingo',        password: 'ZimAgri55!',   verified: true },
    { full_name: 'Tatenda Chirwa',     email: 'tatenda.chirwa@yahoo.com',    phone: '+263777890123',  province: 'Midlands',        password: 'Cattle22!',    verified: false },
    { full_name: 'Farai Mugabe',       email: 'farai.m@gmail.com',           phone: '+263778901234',  province: 'Mashonaland East', password: 'Tractor77!',  verified: true },
    { full_name: 'Rudo Sibanda',       email: 'rudo.sibanda@outlook.com',    phone: '+263779012345',  province: 'Matabeleland North', password: 'Maize100!', verified: false },
    { full_name: 'Kudakwashe Zimuto',  email: 'kuda.zimuto@gmail.com',       phone: '+263770123456',  province: 'Harare',          password: 'Premium88!',   verified: true },
];

// ═══════════════════════════════════════════════
// LISTINGS DATA — Each linked to a specific user
// ═══════════════════════════════════════════════
function getListings() {
    return [
        // ── VEHICLES ────────────────────────────
        { userIdx: 0, category: 'vehicles', title: 'Toyota Hilux 2.8 GD-6 4x4', price: 45000, currency: 'USD',
          description: 'Well-maintained Toyota Hilux, perfect for farm operations and rough terrain. Full service history, low mileage for its age. Excellent condition.',
          province: 'Harare', location: 'Borrowdale',
          image: path.join(PUBLIC_DIR, 'hilux.jpg'),
          specs: { make: 'Toyota', model: 'Hilux', year: '2021', condition: 'Used', fuel_type: 'Diesel', transmission: 'Automatic', mileage: '45,000 km' }},

        { userIdx: 2, category: 'vehicles', title: 'Toyota Fortuner 2.4 GD-6 Auto', price: 52000, currency: 'USD',
          description: 'Premium SUV suitable for both farm inspection runs and executive transport. Leather seats, climate control, reverse camera.',
          province: 'Mashonaland West', location: 'Chinhoyi',
          image: path.join(PUBLIC_DIR, 'fortuner.jpg'),
          specs: { make: 'Toyota', model: 'Fortuner', year: '2022', condition: 'Used', fuel_type: 'Diesel', transmission: 'Automatic', mileage: '28,000 km' }},

        { userIdx: 5, category: 'vehicles', title: 'Ford Ranger Wildtrak 3.2', price: 38000, currency: 'USD',
          description: 'Powerful double cab bakkie with canopy. Ideal for transporting produce and livestock feed. Bull bar and spotlights fitted.',
          province: 'Masvingo', location: 'Masvingo CBD',
          image: path.join(PUBLIC_DIR, 'ford-ranger.jpg'),
          specs: { make: 'Ford', model: 'Ranger', year: '2020', condition: 'Used', fuel_type: 'Diesel', transmission: 'Manual', mileage: '67,000 km' }},

        { userIdx: 3, category: 'vehicles', title: 'Honda Fit Hybrid 1.5', price: 8500, currency: 'USD',
          description: 'Fuel-efficient Honda Fit for daily commuting to the market. Low running costs, perfect second vehicle for the farm.',
          province: 'Matabeleland South', location: 'Gwanda',
          image: path.join(PUBLIC_DIR, 'honda-fit.jpg'),
          specs: { make: 'Honda', model: 'Fit', year: '2019', condition: 'Used', fuel_type: 'Petrol/Hybrid', transmission: 'Automatic', mileage: '52,000 km' }},

        // ── MACHINERY ───────────────────────────
        { userIdx: 7, category: 'machinery', title: 'John Deere 5075E Utility Tractor', price: 32000, currency: 'USD',
          description: '75HP utility tractor with front loader attachment. Excellent for medium-scale farming operations. Recently serviced with new hydraulic lines.',
          province: 'Mashonaland East', location: 'Marondera',
          image: path.join(PUBLIC_DIR, 'tractor-johndeere.jpg'),
          specs: { make: 'John Deere', model: '5075E', year: '2020', condition: 'Used', fuel_type: 'Diesel', mileage: '2,400 hrs' }},

        { userIdx: 0, category: 'machinery', title: 'Massey Ferguson 290 Tractor', price: 18500, currency: 'USD',
          description: 'Reliable MF 290 workhorse. Has been ploughing for 3 seasons with no issues. 2WD, perfect for flat terrain farming.',
          province: 'Harare', location: 'Ruwa',
          image: path.join(PUBLIC_DIR, 'tractor-massey.jpg'),
          specs: { make: 'Massey Ferguson', model: '290', year: '2018', condition: 'Used', fuel_type: 'Diesel', mileage: '3,800 hrs' }},

        { userIdx: 2, category: 'machinery', title: 'New Holland T6.180 AutoCommand', price: 65000, currency: 'USD',
          description: 'Premium New Holland with AutoCommand CVT transmission. GPS-ready, air-conditioned cab. Ideal for large-scale commercial farming.',
          province: 'Mashonaland West', location: 'Karoi',
          image: path.join(PUBLIC_DIR, 'tractor-newholland.jpg'),
          specs: { make: 'New Holland', model: 'T6.180', year: '2023', condition: 'New', fuel_type: 'Diesel', mileage: '120 hrs' }},

        { userIdx: 5, category: 'machinery', title: 'CAT 320 Excavator', price: 85000, currency: 'USD',
          description: 'Heavy-duty CAT excavator for dam construction, land clearing, and irrigation channel digging. Low hours, excellent undercarriage.',
          province: 'Masvingo', location: 'Chiredzi',
          image: path.join(PUBLIC_DIR, 'excavator.jpg'),
          specs: { make: 'Caterpillar', model: '320', year: '2019', condition: 'Used', fuel_type: 'Diesel', mileage: '4,200 hrs' }},

        // ── LIVESTOCK ───────────────────────────
        { userIdx: 1, category: 'livestock', title: 'Brahman Bull — Stud Quality', price: 3500, currency: 'USD',
          description: 'Registered Brahman bull with excellent bloodlines. Heat-tolerant breed, perfect for Zimbabwe\'s climate. All vaccinations up to date.',
          province: 'Bulawayo', location: 'Umguza',
          image: path.join(PUBLIC_DIR, 'cow-brahman.jpg'),
          specs: { breed: 'Brahman', type: 'Cattle', gender: 'Male', health: 'Vaccinated', weight: '750 kg', age: '4 years' }},

        { userIdx: 6, category: 'livestock', title: 'Holstein Dairy Cows x5', price: 7500, currency: 'USD',
          description: 'Batch of 5 productive Holstein dairy cows. Average 18L/day per cow. All currently lactating. Can deliver within Midlands province.',
          province: 'Midlands', location: 'Kwekwe',
          image: path.join(PUBLIC_DIR, 'cow-holstein.jpg'),
          specs: { breed: 'Holstein', type: 'Cattle', gender: 'Female', health: 'Vaccinated', weight: '550 kg each', age: '3-5 years' }},

        { userIdx: 3, category: 'livestock', title: 'Boer Goats — Breeding Pair', price: 850, currency: 'USD',
          description: 'Premium Boer goat breeding pair. Excellent meat breed with fast growth rate. Both animals are registered with pedigree papers.',
          province: 'Matabeleland South', location: 'Beitbridge',
          image: path.join(PUBLIC_DIR, 'goat-boer.jpg'),
          specs: { breed: 'Boer', type: 'Goat', gender: 'Male & Female', health: 'Vaccinated', weight: '85 kg (buck)', age: '2 years' }},

        { userIdx: 8, category: 'livestock', title: 'Hereford Heifers x10', price: 12000, currency: 'USD',
          description: 'Ten quality Hereford heifers ready for breeding. Docile temperament, excellent beef cattle for commercial ranching.',
          province: 'Matabeleland North', location: 'Hwange',
          image: path.join(PUBLIC_DIR, 'cow-hereford.jpg'),
          specs: { breed: 'Hereford', type: 'Cattle', gender: 'Female', health: 'Vaccinated', weight: '400 kg each', age: '18 months' }},

        // ── PRODUCE ─────────────────────────────
        { userIdx: 4, category: 'produce', title: 'Fresh Tomatoes — 500kg Bulk', price: 300, currency: 'USD',
          description: 'Fresh, ripe Roma tomatoes harvested this week. Organically grown, no pesticides. Bulk discount available for orders over 1 ton.',
          province: 'Manicaland', location: 'Mutare',
          image: path.join(AGRI_DIR, 'tomatoes.png'),
          specs: { type: 'Tomatoes', weight: '500 kg', condition: 'Fresh', harvest_date: 'This week' }},

        { userIdx: 9, category: 'produce', title: 'Grade A Maize — 20 Tonnes', price: 6000, currency: 'USD',
          description: 'Premium Grade A white maize, moisture content below 12.5%. Ready for milling. GMB certified. Transport can be arranged.',
          province: 'Harare', location: 'Norton',
          image: path.join(AGRI_DIR, 'maize.png'),
          specs: { type: 'Maize', weight: '20,000 kg', condition: 'Dried & Graded' }},

        { userIdx: 7, category: 'produce', title: 'Sugar Beans — 5 Tonnes', price: 4500, currency: 'USD',
          description: 'High-quality red speckled sugar beans. Clean, no stones or debris. Packaged in 50kg bags. Ideal for retail or wholesale.',
          province: 'Mashonaland East', location: 'Rusape',
          image: path.join(AGRI_DIR, 'sugarbeans.png'),
          specs: { type: 'Sugar Beans', weight: '5,000 kg', condition: 'Dried & Sorted' }},

        { userIdx: 4, category: 'produce', title: 'Potatoes — Fresh Harvest 2 Tonnes', price: 800, currency: 'USD',
          description: 'Freshly harvested BP1 potatoes. Large uniform size, perfect for chips or retail. Available for collection from farm gate.',
          province: 'Manicaland', location: 'Nyanga',
          image: path.join(AGRI_DIR, 'potatoes.png'),
          specs: { type: 'Potatoes', weight: '2,000 kg', condition: 'Fresh' }},

        // ── SPARES ──────────────────────────────
        { userIdx: 9, category: 'spares', title: 'Heavy-Duty Brake Pad Set — Universal Fit', price: 120, currency: 'USD',
          description: 'Premium ceramic brake pads for trucks and bakkies. Fits Toyota, Ford, Isuzu. Long-lasting performance for farm vehicles.',
          province: 'Harare', location: 'Graniteside',
          image: path.join(PUBLIC_DIR, 'spare-brakes.png'),
          specs: { condition: 'New', part_category: 'Brakes & Rotors', part_number: 'BP-HD-2024', compatible: 'Toyota Hilux, Ford Ranger, Isuzu KB' }},

        { userIdx: 1, category: 'spares', title: 'Tractor Engine Overhaul Kit — MF 290', price: 2200, currency: 'USD',
          description: 'Complete engine overhaul kit for Massey Ferguson 290. Includes pistons, rings, gaskets, bearings, and oil seals. Genuine Perkins parts.',
          province: 'Bulawayo', location: 'Kelvin Industrial',
          image: path.join(PUBLIC_DIR, 'spare-engine.png'),
          specs: { condition: 'New', part_category: 'Engine Components', part_number: 'MF290-EOK', compatible: 'Massey Ferguson 290, 285' }},

        { userIdx: 5, category: 'spares', title: 'Air & Oil Filter Pack x10', price: 180, currency: 'USD',
          description: 'Bulk pack of 10 air filters and 10 oil filters. Fits most Japanese 4x4 vehicles. Keep your farm fleet maintained at low cost.',
          province: 'Masvingo', location: 'Masvingo Industrial',
          image: path.join(PUBLIC_DIR, 'spare-filters.png'),
          specs: { condition: 'New', part_category: 'Filters & Fluids', part_number: 'FLT-PACK-10', compatible: 'Toyota, Nissan, Mitsubishi' }},

        // ── EQUIPMENT ───────────────────────────
        { userIdx: 7, category: 'equipment', title: 'Centre Pivot Irrigation System', price: 25000, currency: 'USD',
          description: 'Complete centre pivot system covering 50 hectares. Includes pump, pipes, and sprinkler heads. Can be installed within 2 weeks.',
          province: 'Mashonaland East', location: 'Macheke',
          image: path.join(PUBLIC_DIR, 'harvester-2.png'),
          specs: { condition: 'New', type: 'Irrigation', mileage: 'N/A' }},

        { userIdx: 0, category: 'equipment', title: '3-Point Disc Plough — Heavy Duty', price: 1800, currency: 'USD',
          description: '4-disc heavy-duty plough for deep tillage. Fits standard 3-point hitch on tractors 60HP and above. Hardened steel discs.',
          province: 'Harare', location: 'Southerton',
          image: path.join(PUBLIC_DIR, 'tractor-4.png'),
          specs: { condition: 'New', type: 'Tillage', mileage: 'N/A' }},
    ];
}

// ═══════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════
async function seed() {
    console.log('\n🌱 ═══════════════════════════════════════════');
    console.log('   ZIM AUTOAGRI — DATABASE SEEDER');
    console.log('   ═══════════════════════════════════════════\n');

    const createdUserIds = [];

    // ── STEP 1: Create Test Users ──
    console.log('👥 Creating test accounts...\n');
    for (const user of testUsers) {
        try {
            const hash = await bcrypt.hash(user.password, 10);
            const result = await pool.query(
                `INSERT INTO users (full_name, email, phone, password_hash, province, is_verified)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email) DO UPDATE SET full_name = $1
                 RETURNING id, is_verified`,
                [user.full_name, user.email, user.phone, hash, user.province, user.verified]
            );
            const u = result.rows[0];
            createdUserIds.push(u.id);
            const badge = u.is_verified ? '✅ VERIFIED' : '⏳ Pending';
            console.log(`   ${badge}  ${user.full_name} (${user.email}) → ID #${u.id}`);
        } catch (err) {
            console.error(`   ❌ Failed to create ${user.full_name}:`, err.message);
            createdUserIds.push(null);
        }
    }

    console.log(`\n   ✅ ${createdUserIds.filter(Boolean).length} accounts created!\n`);

    // ── STEP 2: Compress Images & Create Listings ──
    console.log('📦 Creating listings with compressed images...\n');
    const listings = getListings();
    let created = 0;

    for (const listing of listings) {
        const userId = createdUserIds[listing.userIdx];
        if (!userId) { console.log(`   ⚠️  Skipping "${listing.title}" — user not created`); continue; }

        // Check if the source image exists
        if (!fs.existsSync(listing.image)) {
            console.log(`   ⚠️  Image not found: ${listing.image}, skipping "${listing.title}"`);
            continue;
        }

        console.log(`\n   📝 ${listing.title}`);

        // Compress the image using the exact same Sharp algorithm
        const compressedPath = await compressImage(listing.image);
        const images = compressedPath ? [compressedPath] : [];

        // Check if user is verified → auto-feature
        const userCheck = await pool.query('SELECT is_verified FROM users WHERE id = $1', [userId]);
        const isFeatured = userCheck.rows[0]?.is_verified || false;

        try {
            await pool.query(
                `INSERT INTO listings 
                    (user_id, category, title, price, currency, description, province, location, images, specs, is_featured)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                [
                    userId, listing.category, listing.title, listing.price, listing.currency,
                    listing.description, listing.province, listing.location,
                    images, listing.specs, isFeatured
                ]
            );
            const featLabel = isFeatured ? ' ⭐ FEATURED' : '';
            console.log(`   ✅ Created in [${listing.category}] by User #${userId}${featLabel}`);
            created++;
        } catch (err) {
            console.error(`   ❌ DB insert failed for "${listing.title}":`, err.message);
        }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log(`🎉 SEED COMPLETE!`);
    console.log(`   👥 ${createdUserIds.filter(Boolean).length} users created`);
    console.log(`   📦 ${created} listings with compressed images`);
    console.log('═══════════════════════════════════════════════\n');

    await pool.end();
    process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
