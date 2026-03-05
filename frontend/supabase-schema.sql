-- =============================================================
-- ZK-Whisper Reports Table — run this in the Supabase SQL Editor
-- =============================================================

-- 1. Create the reports table
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  location_lat  float8 not null,
  location_lng  float8 not null,
  district      text not null,
  ward_number   int4 not null,
  ipfs_cid      text not null default '',
  upvotes       int4 not null default 0,
  is_petition   boolean not null default false,
  reporter      text not null default 'anonymous',
  category      text not null default 'other',
  title         text not null,
  description   text not null default '',
  image_url     text not null default '',
  status        text not null default 'active',
  tx_hash       text,
  created_at    timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table reports enable row level security;

-- 3. Public read policy — anyone can view reports
create policy "Public read access"
  on reports for select
  using (true);

-- 4. Public insert policy — anonymous whistleblowing
create policy "Public insert access"
  on reports for insert
  with check (true);

-- 5. Public update policy — for upvotes/status changes
create policy "Public update access"
  on reports for update
  using (true);

-- 6. Index for common queries
create index if not exists idx_reports_district on reports (district);
create index if not exists idx_reports_category on reports (category);
create index if not exists idx_reports_status   on reports (status);
create index if not exists idx_reports_created   on reports (created_at desc);

-- =============================================================
-- Seed data — the 11 dummy reports from the app
-- =============================================================

insert into reports (location_lat, location_lng, district, ward_number, ipfs_cid, upvotes, is_petition, reporter, category, title, description, image_url, status, created_at) values
(27.7172, 85.324,   'Kathmandu',        16, 'QmPkR2L5d8hFGo8q7iFbnCJgiMvehA2jB5oZg8LC2r6T', 205, true,  '7Ytt3kLgPkCvxWg3N6pRmz7k2gH1bFx8kFpCadzGkP', 'roads',      'Massive pothole on Ring Road near Kalanki — multiple accidents reported',          'The pothole has been growing for months near the Kalanki intersection. Motorcycles and smaller vehicles are at extreme risk, especially at night when visibility is poor.',                                                                     'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop', 'petition', now() - interval '1 day'),
(27.7085, 85.3188,  'Kathmandu',         4, 'QmRkT2L5d8hFGo8q7iFbnCJgiMvehA2jB5oZg8LC3s7U', 178, true,  'CoX3bJ8xLsVHfKPQ2dJcHmN5rP9vBx4kFpCadzPv5A', 'corruption', 'Ward office demanding illegal fees for citizenship certificates',                  'People are being asked to pay Rs 2000-5000 under the table for citizenship certificate processing that should be free. Multiple witnesses have come forward.',                                                                                    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', 'petition', now() - interval '10 hours'),
(28.2096, 83.9856,  'Kaski',            17, 'QmUnW5O8g1kIr1t0lIeeFMliPxhiD5mE8rCj1OF6v0X', 147, true,  '9FgH2kLmPnCvxWg3N6pQrz7k2gH1bFx8kFpCadzRt3', 'utilities',  'Illegal factory dumping waste into Seti River — broken water pipes flooding streets','Chemical waste from an unregistered factory is leaking through broken municipal pipes directly into the Seti River. Dead fish spotted along 2km stretch. Water supply contaminated.',                                                             'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop', 'petition', now() - interval '5 hours'),
(26.6682, 87.2836,  'Morang',           11, 'QmSlU3M6e9iGHp9r8jGcnDKjhNwfhB3kC6pAh9MD4t8V', 132, true,  '5BnM7rLkPxCvyWh4O7qStz8l3hI2cGy9lGqDbezSu4', 'scam',       'Fake employment agency scamming migrant workers near bus park',                    'An office near the Biratnagar bus park is collecting Rs 50,000-100,000 from workers promising Gulf jobs. Multiple victims confirmed — no actual visa processing happening.',                                                                       'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=400&h=300&fit=crop', 'petition', now() - interval '6 hours'),
(27.672,  85.4298,  'Bhaktapur',         8, 'QmTmV4N7f0jIHq0s9kHdoELkhOxgiC4lD7qBi0NE5u9W',  91, false, '4AmL6qKjOwBuxVg3N6pRsy7j2fH0aEw8jFoCcbyRt3', 'hazards',    'Collapsed retaining wall blocking Arniko Highway — landslide risk',                'Heavy rainfall caused a 30-meter retaining wall to collapse on the highway. Landslide risk is high. Only one lane is passable. Heavy vehicles being diverted through narrow village roads.',                                                       'https://images.unsplash.com/photo-1582407947092-50b8c1a4f3e8?w=400&h=300&fit=crop', 'active',   now() - interval '4 hours'),
(27.6588, 84.4364,  'Chitwan',           5, 'QmVoX6P9h2lJs2u1mJfgGNmjQyiF6nFs9sDk2PG7w1Y',  87, false, '3ZlK5pJiNvAtxUf2M5oQrx6i1eG9zDv7iEnBbaXqS2', 'utilities',  'Open waste burning site — uncollected garbage near residential area in Bharatpur', 'Municipality is burning uncollected waste in an open field adjacent to a school and residential colony. Thick smoke visible daily from 6-9 AM. Children complaining of breathing problems.',                                                       'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop', 'active',   now() - interval '12 hours'),
(27.6769, 85.3157,  'Lalitpur',         12, 'QmWpY7Q0i3mKt3v2nKgeHOnkRzjG7oGt0eFl3QH8x2Z',  64, false, '2YkJ4oIhMuZswTe1L4nPqw5h0dF8yCu6hDmAaZWpR1', 'roads',      'Crater-sized potholes on Satdobato-Godawari road',                                 'Multiple deep potholes along the main road to Godawari. At least 3 motorcycle accidents this week. Road has not been repaired despite multiple complaints to ward office.',                                                                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop', 'active',   now() - interval '18 hours'),
(27.5831, 83.5444,  'Rupandehi',         2, 'QmXqZ8R1j4nLu4w3oLhfIPomSzkH8pHu1gGm4RI9y3A',  42, false, '6DfE0mGfKsXquRc9J2lNot3f8bD6wAs4fBkyYXUnP9', 'roads',      'Broken bridge on Siddhartha Highway poses danger to commuters',                    'The steel railing and concrete surface of the bridge are severely damaged. Heavy vehicles still crossing despite visible structural cracks. Bridge is over 30 years old with no maintenance.',                                                     'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop', 'active',   now() - interval '2 hours'),
(27.6205, 85.5392,  'Kavrepalanchok',    9, 'QmYrA9S2k5oMv5x4pMigJQnlTziI9qIv2hHn5SJ0z4B',  34, false, '1CeD9lFeLrWptQb8I1kMns2e7aC5vZr3eAjxXWTmO8', 'corruption', 'Land registration office demanding bribes for document processing',                 'Officers at the malpot office are openly asking for Rs 5000-10000 to process land registration papers. Normal processing delayed indefinitely without payment.',                                                                                  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', 'active',   now() - interval '30 minutes'),
(28.2024, 81.6271,  'Banke',            14, 'QmZsB0T3l6pNw6y5qNjhKRomUzkJ0rJw3iIo6TK1a5C',  23, false, '0BdC8kEdKqVosPA7H0jLmr1d6zB4uYq2dZiwWVSlN7', 'scam',       'Counterfeit medicine being sold at unlicensed clinic',                             'A clinic operating without a valid license is selling expired and counterfeit medicines to patients. Multiple people reported adverse reactions after taking the medication.',                                                                      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop', 'active',   now() - interval '3 hours'),
(29.2953, 80.588,   'Darchula',          3, 'QmAtC1U4m7qOx7z6rOkhLSqnVakK1sKx4jJp7UK2b6D',  15, false, 'ZAcB7jDcJpUnnOz6G9iKlq0c5yA3tXp1cYhvVUrkM6', 'hazards',    'Flood embankment construction stalled — flooding risk as monsoon approaches',      'Construction of the flood embankment was halted 6 months ago at 40% completion. The contractor has disappeared. With monsoon approaching, serious flooding risk — hundreds of families at danger.',                                                'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop', 'active',   now() - interval '8 hours');
