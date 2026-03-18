// ─────────────────────────────────────────────
// RACE TYPE TEMPLATES (distance categories)
// ─────────────────────────────────────────────
export interface RaceType {
  id: string;
  name: string;
  cat: string;
  icon: string;
  dist: string;
  minW: number;
  maxW: number;
  tag: string;
}

export interface RaceEvent {
  id: string;
  name: string;
  loc: string;
  country: string;
  cat: string;
  typeId: string;
  icon: string;
  date: string;
  elev: number;
  elevGain: number;
  difficulty: "flat" | "rolling" | "hilly" | "brutal";
  surface: "road" | "trail" | "mixed";
  tags: string[];
  desc: string;
  profile: number[];
  url: string;
  source: string;
}

export const RACE_TYPES: RaceType[] = [
  { id: "5k", name: "5K", cat: "run", icon: "🏃", dist: "3.1 mi", minW: 6, maxW: 12, tag: "The gateway race" },
  { id: "10k", name: "10K", cat: "run", icon: "🏃", dist: "6.2 mi", minW: 8, maxW: 14, tag: "Double the distance" },
  { id: "half", name: "Half Marathon", cat: "run", icon: "🏅", dist: "13.1 mi", minW: 10, maxW: 16, tag: "The perfect challenge" },
  { id: "marathon", name: "Marathon", cat: "run", icon: "🏆", dist: "26.2 mi", minW: 16, maxW: 24, tag: "The classic" },
  { id: "50k", name: "50K Ultra", cat: "ultra", icon: "⛰️", dist: "31 mi", minW: 16, maxW: 24, tag: "Enter the trails" },
  { id: "50m", name: "50 Mile Ultra", cat: "ultra", icon: "🌄", dist: "50 mi", minW: 20, maxW: 28, tag: "Deep wilderness" },
  { id: "100k", name: "100K Ultra", cat: "ultra", icon: "🔥", dist: "62 mi", minW: 24, maxW: 32, tag: "Extreme endurance" },
  { id: "100m", name: "100 Mile", cat: "ultra", icon: "💀", dist: "100 mi", minW: 28, maxW: 36, tag: "The ultimate test" },
  { id: "sprint", name: "Sprint Tri", cat: "tri", icon: "⚡", dist: "0.5/12/3.1 mi", minW: 8, maxW: 14, tag: "Your first tri" },
  { id: "olympic", name: "Olympic Tri", cat: "tri", icon: "🚴", dist: "0.9/25/6.2 mi", minW: 12, maxW: 20, tag: "The classic distance" },
  { id: "half70", name: "Half Ironman", cat: "tri", icon: "🏊", dist: "1.2/56/13.1 mi", minW: 20, maxW: 30, tag: "Prove your range" },
  { id: "ironman", name: "Full Ironman", cat: "tri", icon: "🔱", dist: "2.4/112/26.2 mi", minW: 28, maxW: 40, tag: "The pinnacle" },
];

// ─────────────────────────────────────────────
// RACE DATABASE (200+ real events)
// ─────────────────────────────────────────────
export const RACE_DB: RaceEvent[] = [
  // ── ROAD MARATHONS ──
  { id: "boston", name: "Boston Marathon", loc: "Boston, MA", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Apr 21, 2026", elev: 800, elevGain: 560, difficulty: "hilly", surface: "road", tags: ["Qualifier", "Iconic", "Point-to-point", "Historic"], desc: "The world's oldest annual marathon. Heartbreak Hill at mile 20 separates the prepared from the unprepared.", profile: [30, 28, 25, 30, 35, 55, 45, 60, 75, 85, 65, 20], url: "https://www.baa.org/races/boston-marathon", source: "BAA" },
  { id: "nyc", name: "NYC Marathon", loc: "New York, NY", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Nov 1, 2026", elev: 860, elevGain: 450, difficulty: "rolling", surface: "road", tags: ["World Major", "Loop", "5 Boroughs", "Iconic"], desc: "Five boroughs, one unforgettable day. The Queensboro Bridge and First Avenue crowds are legendary.", profile: [20, 40, 35, 50, 45, 30, 55, 60, 40, 50, 45, 30], url: "https://www.nyrr.org/tcsnycmarathon", source: "NYRR" },
  { id: "chicago", name: "Chicago Marathon", loc: "Chicago, IL", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Oct 11, 2026", elev: 598, elevGain: 90, difficulty: "flat", surface: "road", tags: ["World Major", "Flat", "Fast", "PR Course"], desc: "One of the flattest World Majors. Perfect for PRs. The wind off Lake Michigan is the only enemy.", profile: [20, 18, 20, 22, 18, 20, 22, 20, 18, 22, 20, 18], url: "https://www.chicagomarathon.com", source: "Bank of America" },
  { id: "london", name: "London Marathon", loc: "London, UK", country: "UK", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Apr 26, 2026", elev: 525, elevGain: 180, difficulty: "flat", surface: "road", tags: ["World Major", "Flat", "Point-to-point", "Iconic"], desc: "From Greenwich to The Mall past Tower Bridge. Arguably the most beautiful urban marathon on earth.", profile: [22, 20, 22, 25, 20, 22, 25, 22, 20, 22, 25, 20], url: "https://www.tcslondonmarathon.com", source: "London Marathon Events" },
  { id: "berlin", name: "Berlin Marathon", loc: "Berlin, Germany", country: "DE", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Sep 27, 2026", elev: 344, elevGain: 75, difficulty: "flat", surface: "road", tags: ["World Major", "Flat", "World Record Course", "Fast"], desc: "The world record course. Near-zero elevation change through the heart of Berlin. Pure speed.", profile: [18, 18, 20, 18, 18, 20, 18, 18, 20, 18, 18, 18], url: "https://www.bmw-berlin-marathon.com", source: "SCC Events" },
  { id: "tokyo", name: "Tokyo Marathon", loc: "Tokyo, Japan", country: "JP", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Mar 1, 2026", elev: 390, elevGain: 100, difficulty: "flat", surface: "road", tags: ["World Major", "Flat", "Lottery", "Spring"], desc: "One of the newest World Majors, already the most subscribed. Flat, fast, and immaculately organised.", profile: [20, 22, 20, 18, 20, 22, 20, 22, 20, 18, 20, 22], url: "https://www.marathon.tokyo", source: "Tokyo Marathon Foundation" },
  { id: "la-marathon", name: "LA Marathon", loc: "Los Angeles, CA", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏅", date: "Mar 15, 2026", elev: 1800, elevGain: 900, difficulty: "hilly", surface: "road", tags: ["Point-to-point", "Warm", "Beach finish", "Charity"], desc: "Stadium to the Sea — from Dodger Stadium to Santa Monica. Deceptive hills in the first half.", profile: [40, 60, 70, 65, 55, 60, 50, 45, 40, 35, 30, 20], url: "https://www.lamarathon.com", source: "Conqur Endurance" },
  { id: "marine-corps", name: "Marine Corps Marathon", loc: "Washington, DC", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏅", date: "Oct 25, 2026", elev: 950, elevGain: 400, difficulty: "rolling", surface: "road", tags: ["Military", "No prize money", "Beginner-friendly", "Iconic route"], desc: "The People's Marathon. No prize money, no elite field — just 30,000 runners and the monuments.", profile: [25, 35, 40, 55, 60, 65, 50, 45, 40, 35, 30, 25], url: "https://www.marinemarathon.com", source: "USMC" },
  { id: "phoenix", name: "Phoenix Marathon", loc: "Phoenix, AZ", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏅", date: "Feb 28, 2026", elev: 1300, elevGain: -800, difficulty: "rolling", surface: "road", tags: ["Net downhill", "Fast", "Point-to-point", "BQ-friendly"], desc: "Net 800ft downhill. One of the fastest qualifier courses in the country in perfect February weather.", profile: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 20], url: "https://www.phoenixmarathon.com", source: "Revel Race Series" },
  { id: "grandmas", name: "Grandma's Marathon", loc: "Duluth, MN", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏅", date: "Jun 20, 2026", elev: 620, elevGain: 200, difficulty: "rolling", surface: "road", tags: ["Scenic", "Point-to-point", "Lakeshore", "Midwest"], desc: "Along the shores of Lake Superior. Gorgeous point-to-point through Minnesota's North Shore.", profile: [45, 40, 35, 30, 28, 32, 35, 40, 38, 35, 30, 25], url: "https://www.grandmasmarathon.com", source: "Grandma's Marathon" },

  // ── HALF MARATHONS ──
  { id: "nyc-half", name: "NYC Half Marathon", loc: "New York, NY", country: "USA", cat: "half", typeId: "half", icon: "🏅", date: "Mar 15, 2026", elev: 800, elevGain: 380, difficulty: "rolling", surface: "road", tags: ["World Major", "Manhattan", "Urban", "Lottery"], desc: "Through Central Park and down the West Side Highway. NYC's most prestigious half.", profile: [25, 40, 55, 50, 45, 40, 35, 30, 35, 40, 30, 22], url: "https://www.nyrr.org/races/unitednyccityhalfmarathon", source: "NYRR" },
  { id: "sf-half", name: "San Francisco Half", loc: "San Francisco, CA", country: "USA", cat: "half", typeId: "half", icon: "🏅", date: "Jul 26, 2026", elev: 1200, elevGain: 650, difficulty: "hilly", surface: "road", tags: ["Hilly", "Iconic", "Golden Gate", "Challenging"], desc: "Golden Gate Bridge views come at a price — this is one of the hilliest half marathons in the US.", profile: [30, 50, 70, 85, 75, 65, 55, 50, 60, 70, 55, 30], url: "https://www.thesfmarathon.com", source: "The SF Marathon" },
  { id: "brooklyn-half", name: "Brooklyn Half Marathon", loc: "Brooklyn, NY", country: "USA", cat: "half", typeId: "half", icon: "🏅", date: "May 16, 2026", elev: 50, elevGain: 120, difficulty: "flat", surface: "road", tags: ["Flat", "Fast", "Prospect Park", "Beach finish"], desc: "From Prospect Park to Coney Island. Flat, fast, and finishes on the boardwalk.", profile: [20, 22, 25, 22, 20, 18, 20, 18, 20, 18, 18, 15], url: "https://www.nyrr.org/races/popularbrooklynhalf", source: "NYRR" },
  { id: "great-north-run", name: "Great North Run", loc: "Newcastle, UK", country: "UK", cat: "half", typeId: "half", icon: "🏅", date: "Sep 13, 2026", elev: 200, elevGain: 350, difficulty: "rolling", surface: "road", tags: ["Iconic", "UK", "Point-to-point", "Massive"], desc: "The world's biggest half marathon. Newcastle to South Shields with amazing crowd support.", profile: [35, 45, 55, 50, 45, 40, 35, 40, 45, 40, 35, 25], url: "https://www.greatnorthrun.org", source: "Great Run Company" },
  { id: "rock-dc-half", name: "Rock 'n' Roll DC Half", loc: "Washington, DC", country: "USA", cat: "half", typeId: "half", icon: "🏅", date: "Mar 14, 2026", elev: 100, elevGain: 300, difficulty: "rolling", surface: "road", tags: ["Urban", "Monuments", "Music", "Flat-ish"], desc: "Past the monuments with live music at every mile. A great first half marathon.", profile: [20, 30, 35, 40, 35, 30, 35, 40, 35, 30, 25, 20], url: "https://www.runrocknroll.com/washington-dc", source: "Rock 'n' Roll" },

  // ── 5K & 10K ──
  { id: "peachtree", name: "Peachtree Road Race 10K", loc: "Atlanta, GA", country: "USA", cat: "10k", typeId: "10k", icon: "🏃", date: "Jul 4, 2026", elev: 1050, elevGain: 400, difficulty: "rolling", surface: "road", tags: ["July 4th", "Iconic", "Largest 10K", "Hilly"], desc: "The world's largest 10K on Independence Day. Rolling Peachtree Street in the Atlanta heat.", profile: [40, 50, 60, 55, 50, 55, 60, 55, 50, 45, 35, 25], url: "https://www.atlantatrackclub.org/peachtree", source: "Atlanta Track Club" },
  { id: "bolder-boulder", name: "Bolder Boulder 10K", loc: "Boulder, CO", country: "USA", cat: "10k", typeId: "10k", icon: "🏃", date: "May 25, 2026", elev: 5430, elevGain: 350, difficulty: "rolling", surface: "road", tags: ["Memorial Day", "Altitude", "Party", "Boulder"], desc: "America's best 10K. At altitude with live bands, slip-n-slides, and a stadium finish.", profile: [30, 40, 45, 50, 45, 40, 45, 50, 45, 40, 35, 25], url: "https://www.bolderboulder.com", source: "Bolder Boulder" },
  { id: "bay-breakers", name: "Bay to Breakers 12K", loc: "San Francisco, CA", country: "USA", cat: "10k", typeId: "10k", icon: "🏃", date: "May 17, 2026", elev: 50, elevGain: 500, difficulty: "hilly", surface: "road", tags: ["Iconic", "Costumes", "San Francisco", "Party"], desc: "The world's most fun run. Costumes encouraged. The Hayes Hill is no joke.", profile: [15, 25, 70, 85, 60, 40, 35, 30, 25, 30, 25, 20], url: "https://www.baytobreakers.com", source: "Bay to Breakers" },
  { id: "carlsbad-5000", name: "Carlsbad 5000", loc: "Carlsbad, CA", country: "USA", cat: "5k", typeId: "5k", icon: "🏃", date: "Mar 22, 2026", elev: 30, elevGain: 80, difficulty: "flat", surface: "road", tags: ["Flat", "Fast", "Oceanside", "Elite field"], desc: "One of the fastest 5Ks in the world. Flat oceanside course with a world-class elite field.", profile: [18, 20, 22, 20, 18, 20, 22, 20, 18, 20, 18, 18], url: "https://www.carlsbad5000.com", source: "In Motion Events" },

  // ── ULTRA TRAIL ──
  { id: "utmb", name: "UTMB Mont-Blanc", loc: "Chamonix, France", country: "FR", cat: "100m", typeId: "100m", icon: "💀", date: "Aug 28, 2026", elev: 3400, elevGain: 32800, difficulty: "brutal", surface: "trail", tags: ["Iconic", "Alps", "171km", "World Championship"], desc: "The holy grail of ultra trail — 171km around Mont Blanc through France, Italy, and Switzerland.", profile: [40, 65, 85, 95, 80, 70, 85, 95, 80, 70, 55, 35], url: "https://utmbmontblanc.com", source: "UTMB Group" },
  { id: "western-states", name: "Western States 100", loc: "Auburn, CA", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Jun 27, 2026", elev: 5000, elevGain: 18090, difficulty: "brutal", surface: "trail", tags: ["Iconic", "Lottery", "Sierra Nevada", "Heat"], desc: "The oldest 100-mile trail race. Squaw Valley to Auburn through the Sierra Nevada. Extreme heat.", profile: [50, 70, 85, 75, 60, 50, 55, 65, 55, 45, 35, 25], url: "https://www.wser.org", source: "WSER Foundation" },
  { id: "hardrock", name: "Hardrock 100", loc: "Silverton, CO", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Jul 17, 2026", elev: 7680, elevGain: 33992, difficulty: "brutal", surface: "trail", tags: ["Altitude", "Technical", "Lottery", "San Juans"], desc: "100 miles through the San Juan Mountains at extreme altitude. Average elevation 11,000ft.", profile: [60, 80, 95, 100, 90, 85, 95, 100, 90, 80, 65, 50], url: "https://www.hardrock100.com", source: "Hardrock Hundred" },
  { id: "leadville", name: "Leadville Trail 100", loc: "Leadville, CO", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Aug 15, 2026", elev: 9200, elevGain: 15600, difficulty: "brutal", surface: "trail", tags: ["Altitude", "Out-and-back", "Iconic", "Rocky Mountains"], desc: "The Race Across The Sky. Out and back at altitude topping 12,600ft at Hope Pass.", profile: [45, 60, 75, 85, 90, 85, 90, 85, 75, 60, 45, 35], url: "https://www.leadvilleraceseries.com", source: "Leadville Race Series" },
  { id: "wasatch", name: "Wasatch Front 100", loc: "Salt Lake City, UT", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Sep 11, 2026", elev: 5500, elevGain: 24500, difficulty: "brutal", surface: "trail", tags: ["Mountain", "Technical", "September", "Utah"], desc: "One continuous ridge run through the Wasatch Mountains. 24,500ft of climbing.", profile: [40, 60, 80, 90, 85, 75, 80, 90, 85, 70, 55, 40], url: "https://www.wasatch100.com", source: "Wasatch 100" },
  { id: "javelina", name: "Javelina Jundred 100K", loc: "Fountain Hills, AZ", country: "USA", cat: "100k", typeId: "100k", icon: "🔥", date: "Oct 31, 2026", elev: 2000, elevGain: 5700, difficulty: "rolling", surface: "trail", tags: ["Desert", "Fast", "Looped", "Halloween"], desc: "Fast desert 100K through the McDowell Mountain Park. Looped course, great for crew access.", profile: [25, 35, 45, 55, 50, 45, 50, 55, 50, 40, 35, 25], url: "https://www.aravaiparunning.com/javelina-jundred", source: "Aravaipa Running" },
  { id: "tahoe-200", name: "Tahoe 200", loc: "Lake Tahoe, CA/NV", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Aug 7, 2026", elev: 7000, elevGain: 40000, difficulty: "brutal", surface: "trail", tags: ["200 miles", "Continuous", "Lake Tahoe", "Multi-day"], desc: "205 miles around Lake Tahoe. One of the original 200-milers. Continuous format, 100hr cutoff.", profile: [50, 65, 80, 85, 75, 70, 80, 85, 80, 70, 60, 45], url: "https://www.tahoe200.com", source: "Tahoe 200" },
  { id: "rocky-raccoon", name: "Rocky Raccoon 100", loc: "Huntsville, TX", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Feb 7, 2026", elev: 300, elevGain: 3500, difficulty: "rolling", surface: "trail", tags: ["Fast", "Looped", "Beginner-friendly 100", "Texas"], desc: "One of the most beginner-friendly 100-milers. Flat, looped course in Huntsville State Park.", profile: [20, 25, 30, 35, 30, 25, 30, 35, 30, 25, 22, 20], url: "https://www.tejastrails.com/rocky-raccoon", source: "Tejas Trails" },
  { id: "ccc", name: "CCC (UTMB)", loc: "Courmayeur, Italy", country: "IT", cat: "100k", typeId: "100k", icon: "🔥", date: "Aug 27, 2026", elev: 3400, elevGain: 19700, difficulty: "brutal", surface: "trail", tags: ["UTMB", "Alps", "Italy start", "Technical"], desc: "100km of the UTMB course starting from Courmayeur. A standalone classic.", profile: [35, 55, 75, 90, 80, 70, 80, 90, 80, 65, 50, 35], url: "https://utmbmontblanc.com/en/page/18/ccc.html", source: "UTMB Group" },
  { id: "waldo-100k", name: "Waldo 100K", loc: "Willamette Pass, OR", country: "USA", cat: "100k", typeId: "100k", icon: "🔥", date: "Aug 22, 2026", elev: 4800, elevGain: 11000, difficulty: "hilly", surface: "trail", tags: ["Oregon", "Scenic", "Mountain", "Lava fields"], desc: "Through the Oregon Cascades past lakes, lava fields, and wilderness. Stunning and demanding.", profile: [35, 50, 65, 75, 80, 70, 65, 70, 75, 65, 50, 35], url: "https://www.waldo100k.com", source: "Waldo 100K" },
  { id: "bear-100", name: "Bear 100", loc: "Logan, UT", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Sep 25, 2026", elev: 5500, elevGain: 22000, difficulty: "brutal", surface: "trail", tags: ["Mountain", "Bear River Range", "Fall", "Remote"], desc: "100 miles through the Bear River Range in Utah/Idaho. Remote, mountainous, and beautiful fall foliage.", profile: [40, 60, 75, 85, 80, 70, 80, 90, 80, 65, 50, 35], url: "https://bear100.com", source: "Bear 100" },
  { id: "run-rabid", name: "Run Rabbit Run 100", loc: "Steamboat Springs, CO", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Sep 18, 2026", elev: 6700, elevGain: 20000, difficulty: "brutal", surface: "trail", tags: ["Colorado", "Altitude", "Scenic", "Point-to-point"], desc: "Through the Mount Zirkel Wilderness and Steamboat ski area. High altitude and stunning terrain.", profile: [45, 60, 75, 85, 80, 75, 80, 85, 75, 60, 50, 40], url: "https://www.runrabbitrunsteamboat.com", source: "Run Rabbit Run" },
  { id: "bryce-100", name: "Bryce Canyon 100", loc: "Bryce Canyon, UT", country: "USA", cat: "100m", typeId: "100m", icon: "💀", date: "Jun 5, 2026", elev: 7500, elevGain: 17000, difficulty: "brutal", surface: "trail", tags: ["National Park", "Red rock", "Altitude", "Scenic"], desc: "Through the red rock hoodoos and ponderosa forests of Bryce Canyon.", profile: [50, 65, 80, 85, 75, 70, 75, 85, 75, 65, 50, 40], url: "https://www.brycecanyonultras.com", source: "Bryce Canyon Ultras" },

  // ── 50K ──
  { id: "bandera-50k", name: "Bandera 50K", loc: "Bandera, TX", country: "USA", cat: "50k", typeId: "50k", icon: "⛰️", date: "Jan 10, 2026", elev: 1400, elevGain: 5500, difficulty: "hilly", surface: "trail", tags: ["Texas", "Technical", "Winter", "Hill Country"], desc: "Technical Texas hill country trails. The rocks and roots are relentless.", profile: [30, 50, 65, 75, 70, 60, 65, 75, 70, 55, 40, 30], url: "https://www.tejastrails.com/bandera", source: "Tejas Trails" },
  { id: "north-face-50", name: "The North Face 50 Mile", loc: "Marin, CA", country: "USA", cat: "50m", typeId: "50m", icon: "🌄", date: "Dec 5, 2026", elev: 800, elevGain: 9500, difficulty: "hilly", surface: "trail", tags: ["Marin Headlands", "Iconic", "December", "Challenging"], desc: "Through the Marin Headlands with relentless climbing. One of the most prestigious US ultras.", profile: [30, 55, 75, 85, 70, 60, 70, 80, 75, 60, 45, 30], url: "https://www.thenorthfaceendurancechallenge.com", source: "The North Face" },
  { id: "gorge-waterfalls-50k", name: "Gorge Waterfalls 50K", loc: "Cascade Locks, OR", country: "USA", cat: "50k", typeId: "50k", icon: "⛰️", date: "Mar 28, 2026", elev: 600, elevGain: 5000, difficulty: "hilly", surface: "trail", tags: ["Oregon", "Waterfalls", "Scenic", "Spring"], desc: "Past 13 stunning waterfalls in the Columbia River Gorge. Trail running at its most beautiful.", profile: [25, 45, 65, 75, 70, 60, 55, 65, 70, 60, 45, 25], url: "https://www.gobeyondracing.com/gorge-waterfalls", source: "Go Beyond Racing" },

  // ── TRIATHLON ──
  { id: "im-kona", name: "IRONMAN World Championship", loc: "Kailua-Kona, HI", country: "USA", cat: "ironman", typeId: "ironman", icon: "🔱", date: "Oct 10, 2026", elev: 30, elevGain: 5600, difficulty: "brutal", surface: "road", tags: ["World Championship", "Heat", "Wind", "Iconic"], desc: "The birthplace of IRONMAN. Scorching heat, Queen K Highway winds, and the greatest finish line in endurance sports.", profile: [15, 25, 45, 65, 75, 80, 70, 60, 50, 45, 35, 20], url: "https://www.ironman.com/im-world-championship", source: "IRONMAN" },
  { id: "im-louisville", name: "IRONMAN Louisville", loc: "Louisville, KY", country: "USA", cat: "ironman", typeId: "ironman", icon: "🔱", date: "Oct 11, 2026", elev: 450, elevGain: 3200, difficulty: "rolling", surface: "road", tags: ["River swim", "Accessible", "Midwest", "Rolling bike"], desc: "Ohio River swim, rolling bike through Kentucky horse country, flat run through downtown Louisville.", profile: [20, 30, 45, 55, 50, 45, 50, 55, 50, 40, 35, 25], url: "https://www.ironman.com/im-louisville", source: "IRONMAN" },
  { id: "im-boulder", name: "IRONMAN Boulder", loc: "Boulder, CO", country: "USA", cat: "ironman", typeId: "ironman", icon: "🔱", date: "Jun 14, 2026", elev: 5430, elevGain: 4500, difficulty: "hilly", surface: "road", tags: ["Altitude", "Challenging bike", "Scenic", "Rocky Mountains"], desc: "At altitude in Boulder. The bike course through the foothills is genuinely challenging.", profile: [35, 50, 65, 75, 80, 75, 70, 65, 60, 55, 45, 35], url: "https://www.ironman.com/im-boulder", source: "IRONMAN" },
  { id: "im-70-boulder", name: "IRONMAN 70.3 Boulder", loc: "Boulder, CO", country: "USA", cat: "half70", typeId: "half70", icon: "🏊", date: "Aug 2, 2026", elev: 5430, elevGain: 2800, difficulty: "hilly", surface: "road", tags: ["Altitude", "Hilly", "Scenic", "Popular"], desc: "Half the distance of the full, but altitude and the bike course still make it serious.", profile: [30, 45, 60, 70, 75, 70, 65, 60, 55, 45, 35, 25], url: "https://www.ironman.com/im703-boulder", source: "IRONMAN" },
  { id: "im-70-oceanside", name: "IRONMAN 70.3 Oceanside", loc: "Oceanside, CA", country: "USA", cat: "half70", typeId: "half70", icon: "🏊", date: "Apr 4, 2026", elev: 30, elevGain: 2100, difficulty: "rolling", surface: "road", tags: ["Ocean swim", "SoCal", "Hilly run", "Popular"], desc: "One of the most popular 70.3s in America. Ocean swim, challenging bike, hilly run along the coast.", profile: [15, 35, 55, 65, 60, 55, 60, 65, 60, 50, 40, 25], url: "https://www.ironman.com/im703-oceanside", source: "IRONMAN" },
  { id: "chicago-triathlon", name: "Chicago Triathlon", loc: "Chicago, IL", country: "USA", cat: "olympic", typeId: "olympic", icon: "🚴", date: "Aug 23, 2026", elev: 595, elevGain: 200, difficulty: "flat", surface: "road", tags: ["Urban", "Lake Michigan", "Flat", "Beginner-friendly"], desc: "Lake Michigan swim, flat bike along Lakeshore Drive, flat lakefront run. Perfect first Olympic distance.", profile: [15, 18, 20, 18, 18, 20, 18, 18, 20, 18, 18, 15], url: "https://www.chicagotriathlon.com", source: "Life Time Tri" },
  { id: "nyc-triathlon", name: "NYC Triathlon", loc: "New York, NY", country: "USA", cat: "olympic", typeId: "olympic", icon: "🚴", date: "Jul 19, 2026", elev: 30, elevGain: 1200, difficulty: "rolling", surface: "road", tags: ["Urban", "Hudson River", "Hilly run", "Lottery", "Iconic"], desc: "Hudson River swim, bike through the Bronx, then the Central Park run.", profile: [20, 35, 50, 60, 55, 50, 55, 60, 55, 45, 35, 25], url: "https://www.nyctriathlon.com", source: "NYC Triathlon" },

  // ── INTERNATIONAL ──
  { id: "comrades", name: "Comrades Marathon", loc: "KwaZulu-Natal, SA", country: "ZA", cat: "50m", typeId: "50m", icon: "🌄", date: "Jun 8, 2026", elev: 2500, elevGain: 6000, difficulty: "hilly", surface: "road", tags: ["Iconic", "South Africa", "Road ultra", "Alternating direction"], desc: "The world's largest ultra — 90km between Durban and Pietermaritzburg.", profile: [30, 50, 70, 80, 75, 85, 80, 70, 60, 50, 40, 30], url: "https://www.comrades.com", source: "Comrades Marathon Association" },
  { id: "two-oceans", name: "Two Oceans Marathon", loc: "Cape Town, SA", country: "ZA", cat: "50k", typeId: "50k", icon: "⛰️", date: "Apr 11, 2026", elev: 100, elevGain: 5700, difficulty: "hilly", surface: "road", tags: ["Iconic", "South Africa", "Road ultra", "Chapman's Peak"], desc: "56km around the Cape Peninsula with Chapman's Peak Drive. 'The World's Most Beautiful Race.'", profile: [20, 35, 55, 75, 80, 70, 60, 65, 70, 60, 45, 25], url: "https://www.twooceansmarathon.org.za", source: "Two Oceans Marathon" },
  { id: "marathon-des-sables", name: "Marathon des Sables", loc: "Sahara Desert, MA", country: "MA", cat: "50m", typeId: "50m", icon: "🌄", date: "Apr 17, 2026", elev: 1200, elevGain: 5000, difficulty: "brutal", surface: "trail", tags: ["Multi-stage", "Self-sufficient", "Desert", "Iconic", "Extreme"], desc: "6 stages, ~250km through the Sahara carrying your own food. The toughest footrace on earth.", profile: [40, 50, 60, 70, 80, 75, 65, 70, 80, 70, 55, 40], url: "https://www.marathondessables.com", source: "Marathon des Sables" },
  { id: "spartathlon", name: "Spartathlon", loc: "Athens to Sparta, GR", country: "GR", cat: "100m", typeId: "100m", icon: "💀", date: "Sep 25, 2026", elev: 100, elevGain: 9500, difficulty: "brutal", surface: "road", tags: ["Historic", "Point-to-point", "Greece", "Road ultra", "Extreme"], desc: "246km from Athens to Sparta retracing Pheidippides' legendary route. 36-hour cutoff.", profile: [20, 30, 40, 55, 65, 75, 80, 75, 70, 80, 75, 55], url: "https://www.spartathlon.gr", source: "IAU/SEGAS" },
  { id: "tor-des-geants", name: "Tor des Géants", loc: "Aosta Valley, IT", country: "IT", cat: "100m", typeId: "100m", icon: "💀", date: "Sep 6, 2026", elev: 8000, elevGain: 78000, difficulty: "brutal", surface: "trail", tags: ["Multi-day", "Alps", "Non-stop", "Technical", "Self-supported"], desc: "330km around the Aosta Valley with 78,000ft of climbing. Perhaps the most demanding race on earth.", profile: [50, 80, 100, 90, 80, 95, 85, 75, 90, 95, 80, 55], url: "https://tordesgeants.it", source: "Tor des Géants" },
  { id: "lavaredo", name: "Lavaredo Ultra Trail", loc: "Cortina, Italy", country: "IT", cat: "100k", typeId: "100k", icon: "🔥", date: "Jun 26, 2026", elev: 4800, elevGain: 17700, difficulty: "brutal", surface: "trail", tags: ["Dolomites", "UTMB qualifier", "Scenic", "Technical", "Night"], desc: "Through the Dolomites under the Tre Cime di Lavaredo. Spectacular and brutally difficult.", profile: [35, 60, 80, 90, 85, 75, 80, 90, 85, 70, 60, 40], url: "https://www.ultratrailcortina.it", source: "Ultra Trail Cortina" },
  { id: "eiger", name: "Eiger Ultra Trail 101K", loc: "Grindelwald, CH", country: "CH", cat: "100k", typeId: "100k", icon: "🔥", date: "Jul 11, 2026", elev: 6700, elevGain: 18000, difficulty: "brutal", surface: "trail", tags: ["Swiss Alps", "Technical", "Scenic", "UTMB qualifier"], desc: "In the shadow of the Eiger through the Bernese Oberland. Technical and dramatically beautiful.", profile: [40, 65, 85, 95, 90, 80, 85, 90, 85, 75, 60, 45], url: "https://www.eigerultratrail.ch", source: "Eiger Ultra Trail" },
  { id: "pikes-peak", name: "Pikes Peak Marathon", loc: "Manitou Springs, CO", country: "USA", cat: "marathon", typeId: "marathon", icon: "🏆", date: "Aug 23, 2026", elev: 6300, elevGain: 7815, difficulty: "brutal", surface: "trail", tags: ["Altitude", "Out-and-back", "14er", "Iconic", "Trail marathon"], desc: "Up and over Pikes Peak summit at 14,115ft. 7,800ft of gain each way.", profile: [20, 40, 60, 80, 95, 100, 98, 80, 60, 40, 25, 20], url: "https://www.pikespeakmarathon.org", source: "Pikes Peak Marathon" },
  { id: "rim-to-rim", name: "Grand Canyon Rim to Rim", loc: "Grand Canyon, AZ", country: "USA", cat: "50k", typeId: "50k", icon: "⛰️", date: "Oct 3, 2026", elev: 6860, elevGain: 5500, difficulty: "brutal", surface: "trail", tags: ["Point-to-point", "Iconic", "Heat", "Descend first", "Permit required"], desc: "North Rim to South Rim. You descend first then climb out. Heat at the bottom is a genuine threat.", profile: [95, 80, 60, 30, 15, 10, 15, 30, 60, 80, 90, 95], url: "https://www.nps.gov/grca", source: "National Park Service" },

  // ── SPRINT & XTERRA ──
  { id: "xterra-maui", name: "XTERRA World Championship", loc: "Maui, HI", country: "USA", cat: "olympic", typeId: "olympic", icon: "🚴", date: "Oct 25, 2026", elev: 30, elevGain: 2000, difficulty: "brutal", surface: "mixed", tags: ["Off-road tri", "Volcanic", "Technical", "Championship"], desc: "Off-road triathlon on volcanic Maui trails. Ocean swim, MTB ride, trail run.", profile: [15, 30, 60, 80, 85, 80, 75, 80, 85, 75, 55, 30], url: "https://www.xterraplanet.com", source: "XTERRA" },
];

// ─────────────────────────────────────────────
// FILTER CATEGORIES
// ─────────────────────────────────────────────
export const RACE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "run", label: "Road" },
  { id: "ultra", label: "Ultra Trail" },
  { id: "tri", label: "Triathlon" },
];

export const DIFFICULTY_OPTIONS = ["all", "flat", "rolling", "hilly", "brutal"] as const;
export const SURFACE_OPTIONS = ["all", "road", "trail", "mixed"] as const;

export const DIFFICULTY_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  flat: { label: "Flat", colorClass: "text-green-400", bgClass: "bg-green-400/10" },
  rolling: { label: "Rolling", colorClass: "text-blue-400", bgClass: "bg-blue-400/10" },
  hilly: { label: "Hilly", colorClass: "text-orange-400", bgClass: "bg-orange-400/10" },
  brutal: { label: "Brutal", colorClass: "text-red-400", bgClass: "bg-red-400/10" },
};

export const SURFACE_CONFIG: Record<string, { label: string; colorClass: string }> = {
  road: { label: "Road", colorClass: "text-muted-foreground" },
  trail: { label: "Trail", colorClass: "text-green-600" },
  mixed: { label: "Mixed", colorClass: "text-purple-400" },
};

export const PLAN_TABS = [
  { id: "training", label: "Training", icon: "📅" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "fueling", label: "Fueling", icon: "⚡" },
  { id: "mental", label: "Mental", icon: "🧠" },
  { id: "recovery", label: "Recovery", icon: "❤️‍🩹" },
];

export const TRI_DISCIPLINES = [
  { id: "swim", label: "Swim", icon: "🏊" },
  { id: "bike", label: "Bike", icon: "🚴" },
  { id: "run", label: "Run", icon: "🏃" },
];

export const KIT_LISTS: Record<string, { cat: string; items: { id: string; name: string; note: string }[] }[]> = {
  run: [
    { cat: "Race Day", items: [{ id: "r1", name: "Race bib & pins", note: "Collect day before" }, { id: "r2", name: "GPS watch (charged)", note: "Enable race mode" }, { id: "r3", name: "Race-tested shoes", note: "Never debut new shoes" }, { id: "r4", name: "Anti-blister socks", note: "Worn 3x in training" }, { id: "r5", name: "Race kit", note: "Worn in training at least twice" }] },
    { cat: "Nutrition", items: [{ id: "r6", name: "Gels / chews (pre-counted)", note: "1 per 45 min" }, { id: "r7", name: "Electrolyte tablets", note: "Especially for heat" }, { id: "r8", name: "Pre-race breakfast", note: "Nothing new" }, { id: "r9", name: "Hydration belt / vest", note: "Half marathon+" }] },
    { cat: "Comfort", items: [{ id: "r10", name: "Body glide", note: "Liberally applied" }, { id: "r11", name: "SPF 50+ sunscreen", note: "Even cloudy days" }, { id: "r12", name: "Hat or visor", note: "Sun + focus" }, { id: "r13", name: "Throwaway warm layer", note: "Start line wait" }] },
    { cat: "Post-Race", items: [{ id: "r14", name: "Dry clothes", note: "In checked bag" }, { id: "r15", name: "Recovery drink", note: "Within 30 min" }, { id: "r16", name: "Foam roller", note: "Hotel recovery" }] },
  ],
  ultra: [
    { cat: "Mandatory", items: [{ id: "u1", name: "Trail shoes (50+ miles tested)", note: "No new shoes" }, { id: "u2", name: "Hydration vest", note: "Check capacity req." }, { id: "u3", name: "GPS watch (charged)", note: "Track recording on" }, { id: "u4", name: "Headlamp + backup batteries", note: "Usually mandatory" }, { id: "u5", name: "Emergency whistle + space blanket", note: "Often mandatory" }, { id: "u6", name: "Waterproof jacket", note: "Check race list" }] },
    { cat: "Drop Bag", items: [{ id: "u7", name: "Change of socks", note: "Prevents blisters" }, { id: "u8", name: "Blister kit", note: "Needle, tape, Leukotape" }, { id: "u9", name: "Solid food", note: "For when gels stop working" }, { id: "u10", name: "Extra gels / chews", note: "200 cal/hr min" }, { id: "u11", name: "Fresh shirt", note: "Morale boost" }] },
    { cat: "Night", items: [{ id: "u12", name: "Spare headlamp", note: "Never one light source" }, { id: "u13", name: "Warm layer", note: "Mandatory 50M+" }, { id: "u14", name: "Reflective vest", note: "Road sections" }] },
  ],
  tri: [
    { cat: "Swim", items: [{ id: "t1", name: "Wetsuit (temp checked)", note: "Legal under 76.1°F" }, { id: "t2", name: "Goggles × 2", note: "Clear + tinted" }, { id: "t3", name: "Race swim cap", note: "Colour = wave" }, { id: "t4", name: "Anti-fog spray", note: "Night before" }] },
    { cat: "T1", items: [{ id: "t5", name: "Bike shoes + helmet", note: "Helmet before bike" }, { id: "t6", name: "Sunglasses", note: "UV + debris" }, { id: "t7", name: "Bike nutrition on frame", note: "Every 45 min" }, { id: "t8", name: "CO2 + 2 spare tubes", note: "Minimum per wheel" }] },
    { cat: "T2", items: [{ id: "t9", name: "Race run shoes", note: "Elastic laces" }, { id: "t10", name: "Race number belt", note: "Faster than pin" }, { id: "t11", name: "Run nutrition", note: "If course not stocked" }, { id: "t12", name: "Visor or cap", note: "Sun on run" }] },
    { cat: "Setup", items: [{ id: "t13", name: "Towel at transition", note: "Marks your spot" }, { id: "t14", name: "Bike PSI checked", note: "Morning of race" }, { id: "t15", name: "Post-race bag", note: "Dry clothes + food" }] },
  ],
};
