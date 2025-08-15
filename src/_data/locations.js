// Comprehensive location data with accurate zip codes and neighborhoods
module.exports = function() {
  return {
    // Major cities with detailed local data
    cities: {
      // CALIFORNIA
      "los-angeles": {
        city: "Los Angeles",
        state: "California",
        stateSlug: "california",
        population: 3898747,
        medianIncome: 65290,
        tier: 1,
        coordinates: { lat: 34.0522, lng: -118.2437 },
        zipCodes: ["90001", "90012", "90025", "90028", "90034", "90036", "90045", "90048", "90064", "90066", "90067", "90069", "90210", "90212", "90230", "90291", "90292", "90401", "90402", "90403", "90404", "90405"],
        neighborhoods: [
          { name: "Hollywood", zipCodes: ["90028", "90038", "90068"] },
          { name: "Beverly Hills", zipCodes: ["90210", "90211", "90212"] },
          { name: "Santa Monica", zipCodes: ["90401", "90402", "90403", "90404", "90405"] },
          { name: "Venice", zipCodes: ["90291", "90292", "90294"] },
          { name: "Downtown LA", zipCodes: ["90012", "90013", "90014", "90015", "90017"] },
          { name: "West LA", zipCodes: ["90025", "90064", "90066", "90067"] },
          { name: "Brentwood", zipCodes: ["90049", "90272"] },
          { name: "Century City", zipCodes: ["90067", "90277"] },
          { name: "Marina del Rey", zipCodes: ["90292", "90295"] },
          { name: "Westwood", zipCodes: ["90024", "90095"] }
        ],
        recyclingPartners: ["LA Mattress Recycling Center", "Green LA Disposal", "SoCal Recycling Solutions"],
        localRegulations: "Los Angeles requires proper mattress disposal per Municipal Code Chapter V, Article 6. Illegal dumping fines range from $500 to $3,000.",
        serviceNotes: "We service all LA neighborhoods including high-rise buildings in Downtown and beachfront properties in Venice and Santa Monica.",
        nearbyCities: [
          { name: "Long Beach", slug: "long-beach", distance: 20 },
          { name: "Glendale", slug: "glendale", distance: 10 },
          { name: "Pasadena", slug: "pasadena", distance: 11 },
          { name: "Burbank", slug: "burbank", distance: 12 },
          { name: "Santa Monica", slug: "santa-monica", distance: 8 },
          { name: "Beverly Hills", slug: "beverly-hills", distance: 6 }
        ]
      },
      
      "san-francisco": {
        city: "San Francisco",
        state: "California",
        stateSlug: "california",
        population: 873965,
        medianIncome: 112376,
        tier: 1,
        coordinates: { lat: 37.7749, lng: -122.4194 },
        zipCodes: ["94102", "94103", "94104", "94105", "94107", "94108", "94109", "94110", "94111", "94112", "94114", "94115", "94116", "94117", "94118", "94121", "94122", "94123", "94124", "94127", "94131", "94132", "94133", "94134"],
        neighborhoods: [
          { name: "Financial District", zipCodes: ["94104", "94111"] },
          { name: "Mission District", zipCodes: ["94103", "94110"] },
          { name: "Castro", zipCodes: ["94114"] },
          { name: "Pacific Heights", zipCodes: ["94115", "94123"] },
          { name: "Marina District", zipCodes: ["94123"] },
          { name: "SoMa", zipCodes: ["94103", "94105", "94107"] },
          { name: "Nob Hill", zipCodes: ["94108", "94109"] },
          { name: "Richmond District", zipCodes: ["94118", "94121"] },
          { name: "Sunset District", zipCodes: ["94116", "94122"] },
          { name: "Haight-Ashbury", zipCodes: ["94117"] }
        ],
        recyclingPartners: ["SF Environment Recycling", "Bay Area Mattress Recovery", "Golden Gate Recycling"],
        localRegulations: "San Francisco mandates mattress recycling under the city's Zero Waste initiative. All mattresses must be diverted from landfills.",
        serviceNotes: "Specialized service for steep hills, narrow Victorian stairways, and high-rise condos throughout SF.",
        nearbyCities: [
          { name: "Oakland", slug: "oakland", distance: 12 },
          { name: "San Jose", slug: "san-jose", distance: 48 },
          { name: "Berkeley", slug: "berkeley", distance: 13 },
          { name: "Daly City", slug: "daly-city", distance: 9 },
          { name: "Fremont", slug: "fremont", distance: 35 },
          { name: "Palo Alto", slug: "palo-alto", distance: 35 }
        ]
      },
      
      "san-diego": {
        city: "San Diego",
        state: "California",
        stateSlug: "california",
        population: 1425976,
        medianIncome: 79673,
        tier: 1,
        coordinates: { lat: 32.7157, lng: -117.1611 },
        zipCodes: ["92101", "92102", "92103", "92104", "92105", "92106", "92107", "92108", "92109", "92110", "92111", "92113", "92114", "92115", "92116", "92117", "92119", "92120", "92121", "92122", "92123", "92124", "92126", "92127", "92128", "92129", "92130", "92131", "92134", "92139", "92140"],
        neighborhoods: [
          { name: "Downtown/Gaslamp", zipCodes: ["92101"] },
          { name: "La Jolla", zipCodes: ["92037", "92038", "92039"] },
          { name: "Pacific Beach", zipCodes: ["92109"] },
          { name: "Mission Beach", zipCodes: ["92109"] },
          { name: "Point Loma", zipCodes: ["92106", "92107"] },
          { name: "Hillcrest", zipCodes: ["92103"] },
          { name: "North Park", zipCodes: ["92104"] },
          { name: "Mission Valley", zipCodes: ["92108"] },
          { name: "Carmel Valley", zipCodes: ["92130"] },
          { name: "Rancho Bernardo", zipCodes: ["92127", "92128"] }
        ],
        recyclingPartners: ["SD Mattress Recycling", "Pacific Recycling Center", "EcoMattress San Diego"],
        localRegulations: "San Diego prohibits mattress disposal in regular trash. City ordinance requires recycling or proper disposal at designated facilities.",
        serviceNotes: "Service from beach communities to inland valleys, including military housing and university dormitories.",
        nearbyCities: [
          { name: "Chula Vista", slug: "chula-vista", distance: 7 },
          { name: "Oceanside", slug: "oceanside", distance: 38 },
          { name: "Escondido", slug: "escondido", distance: 30 },
          { name: "Carlsbad", slug: "carlsbad", distance: 35 }
        ]
      },
      
      // TEXAS
      "houston": {
        city: "Houston",
        state: "Texas",
        stateSlug: "texas",
        population: 2320268,
        medianIncome: 52338,
        tier: 1,
        coordinates: { lat: 29.7604, lng: -95.3698 },
        zipCodes: ["77001", "77002", "77003", "77004", "77005", "77006", "77007", "77008", "77009", "77010", "77019", "77020", "77024", "77025", "77027", "77030", "77036", "77040", "77042", "77043", "77046", "77056", "77057", "77063", "77070", "77077", "77079", "77080", "77081", "77082", "77084", "77089", "77094", "77095", "77096", "77098"],
        neighborhoods: [
          { name: "Downtown", zipCodes: ["77002", "77010"] },
          { name: "River Oaks", zipCodes: ["77019", "77027"] },
          { name: "The Heights", zipCodes: ["77007", "77008", "77009"] },
          { name: "Montrose", zipCodes: ["77006", "77019"] },
          { name: "Galleria/Uptown", zipCodes: ["77024", "77027", "77056", "77057"] },
          { name: "Memorial", zipCodes: ["77024", "77079"] },
          { name: "West University", zipCodes: ["77005", "77025"] },
          { name: "Sugar Land", zipCodes: ["77478", "77479", "77498"] },
          { name: "Katy", zipCodes: ["77449", "77450", "77493", "77494"] },
          { name: "The Woodlands", zipCodes: ["77380", "77381", "77382", "77384", "77389"] }
        ],
        recyclingPartners: ["Houston Mattress Recycling", "Gulf Coast Recycling", "Texas Environmental Services"],
        localRegulations: "Houston's Solid Waste Management Code prohibits illegal dumping with fines up to $5,000. Large items require special pickup scheduling.",
        serviceNotes: "Serving all Houston areas from inner loop luxury high-rises to suburban master-planned communities.",
        nearbyCities: [
          { name: "Sugar Land", slug: "sugar-land", distance: 20 },
          { name: "The Woodlands", slug: "the-woodlands", distance: 28 },
          { name: "Pasadena", slug: "pasadena-tx", distance: 10 },
          { name: "Pearland", slug: "pearland", distance: 17 }
        ]
      },
      
      "dallas": {
        city: "Dallas",
        state: "Texas",
        stateSlug: "texas",
        population: 1343573,
        medianIncome: 52580,
        tier: 1,
        coordinates: { lat: 32.7767, lng: -96.7970 },
        zipCodes: ["75201", "75202", "75203", "75204", "75205", "75206", "75207", "75208", "75209", "75210", "75214", "75215", "75218", "75219", "75220", "75223", "75224", "75225", "75226", "75227", "75228", "75229", "75230", "75231", "75232", "75233", "75234", "75235", "75237", "75238", "75240", "75243", "75244", "75246", "75247", "75248", "75251", "75252", "75254"],
        neighborhoods: [
          { name: "Downtown/Deep Ellum", zipCodes: ["75201", "75202", "75226"] },
          { name: "Uptown", zipCodes: ["75201", "75204"] },
          { name: "Highland Park", zipCodes: ["75205", "75209", "75219", "75225"] },
          { name: "Oak Lawn", zipCodes: ["75219", "75209"] },
          { name: "Lakewood", zipCodes: ["75214", "75218"] },
          { name: "Preston Hollow", zipCodes: ["75225", "75230"] },
          { name: "North Dallas", zipCodes: ["75248", "75252", "75254"] },
          { name: "East Dallas", zipCodes: ["75206", "75214", "75223"] },
          { name: "Oak Cliff", zipCodes: ["75208", "75211", "75224", "75233"] },
          { name: "Far North Dallas", zipCodes: ["75287", "75251", "75252"] }
        ],
        recyclingPartners: ["Dallas County Recycling", "North Texas Mattress Recovery", "DFW Environmental Services"],
        localRegulations: "Dallas City Code Chapter 18 requires proper disposal of large items. Illegal dumping violations result in fines from $500 to $4,000.",
        serviceNotes: "Full coverage from downtown high-rises to sprawling North Dallas estates and historic neighborhoods.",
        nearbyCities: [
          { name: "Fort Worth", slug: "fort-worth", distance: 32 },
          { name: "Arlington", slug: "arlington", distance: 20 },
          { name: "Plano", slug: "plano", distance: 19 },
          { name: "Irving", slug: "irving", distance: 13 }
        ]
      },
      
      "austin": {
        city: "Austin",
        state: "Texas",
        stateSlug: "texas",
        population: 978908,
        medianIncome: 71576,
        tier: 1,
        coordinates: { lat: 30.2672, lng: -97.7431 },
        zipCodes: ["78701", "78702", "78703", "78704", "78705", "78712", "78721", "78722", "78723", "78724", "78725", "78726", "78727", "78728", "78729", "78730", "78731", "78732", "78733", "78734", "78735", "78736", "78737", "78738", "78739", "78741", "78742", "78744", "78745", "78746", "78747", "78748", "78749", "78750", "78751", "78752", "78753", "78754", "78756", "78757", "78758", "78759"],
        neighborhoods: [
          { name: "Downtown", zipCodes: ["78701"] },
          { name: "South Congress (SoCo)", zipCodes: ["78704"] },
          { name: "East Austin", zipCodes: ["78702", "78721", "78722", "78723"] },
          { name: "Westlake Hills", zipCodes: ["78746", "78733"] },
          { name: "Hyde Park", zipCodes: ["78751", "78705"] },
          { name: "Zilker", zipCodes: ["78704", "78746"] },
          { name: "Mueller", zipCodes: ["78723"] },
          { name: "Domain/North Austin", zipCodes: ["78758", "78759"] },
          { name: "Circle C", zipCodes: ["78739", "78749"] },
          { name: "Lake Travis", zipCodes: ["78730", "78732", "78734", "78738"] }
        ],
        recyclingPartners: ["Austin Resource Recovery", "Central Texas Recycling", "Keep Austin Beautiful"],
        localRegulations: "Austin's Zero Waste initiative requires mattress recycling. The city provides special collection for large items with appointment.",
        serviceNotes: "Eco-conscious service throughout Austin, from downtown condos to Hill Country estates.",
        nearbyCities: [
          { name: "Round Rock", slug: "round-rock", distance: 17 },
          { name: "Cedar Park", slug: "cedar-park", distance: 16 },
          { name: "Georgetown", slug: "georgetown", distance: 27 },
          { name: "San Marcos", slug: "san-marcos", distance: 30 }
        ]
      },
      
      "san-antonio": {
        city: "San Antonio",
        state: "Texas",
        stateSlug: "texas",
        population: 1547253,
        medianIncome: 49711,
        tier: 1,
        coordinates: { lat: 29.4241, lng: -98.4936 },
        zipCodes: ["78201", "78202", "78203", "78204", "78205", "78207", "78208", "78209", "78210", "78211", "78212", "78213", "78214", "78215", "78216", "78217", "78218", "78219", "78220", "78221", "78222", "78223", "78224", "78225", "78226", "78227", "78228", "78229", "78230", "78231", "78232", "78233", "78234", "78235", "78236", "78237", "78238", "78239", "78240", "78242", "78244", "78245", "78247", "78248", "78249", "78250", "78251", "78252", "78253", "78254", "78255", "78256", "78257", "78258", "78259", "78260", "78261"],
        neighborhoods: [
          { name: "Downtown/River Walk", zipCodes: ["78205", "78212"] },
          { name: "Alamo Heights", zipCodes: ["78209", "78212"] },
          { name: "Stone Oak", zipCodes: ["78258", "78259", "78260"] },
          { name: "The Dominion", zipCodes: ["78257"] },
          { name: "Medical Center", zipCodes: ["78229", "78240"] },
          { name: "Southtown", zipCodes: ["78204", "78210"] },
          { name: "Monte Vista", zipCodes: ["78212"] },
          { name: "North Central", zipCodes: ["78216", "78217", "78218"] },
          { name: "Westside", zipCodes: ["78227", "78228", "78237"] },
          { name: "Far West", zipCodes: ["78245", "78250", "78251", "78253", "78254"] }
        ],
        recyclingPartners: ["Alamo City Recycling", "South Texas Mattress Recovery", "SA Environmental Services"],
        localRegulations: "San Antonio requires bulky item collection appointment through 311. Illegal dumping fines range from $200 to $2,000.",
        serviceNotes: "Service from historic downtown to modern Stone Oak, including military bases and university campuses.",
        nearbyCities: [
          { name: "New Braunfels", slug: "new-braunfels", distance: 31 },
          { name: "Boerne", slug: "boerne", distance: 31 },
          { name: "Schertz", slug: "schertz", distance: 16 },
          { name: "Seguin", slug: "seguin", distance: 36 }
        ]
      },
      
      // FLORIDA
      "miami": {
        city: "Miami",
        state: "Florida",
        stateSlug: "florida",
        population: 467963,
        medianIncome: 40423,
        tier: 1,
        coordinates: { lat: 25.7617, lng: -80.1918 },
        zipCodes: ["33101", "33109", "33125", "33126", "33127", "33128", "33129", "33130", "33131", "33132", "33133", "33134", "33135", "33136", "33137", "33138", "33139", "33140", "33141", "33142", "33143", "33144", "33145", "33146", "33147", "33149", "33150"],
        neighborhoods: [
          { name: "Downtown/Brickell", zipCodes: ["33130", "33131", "33132"] },
          { name: "South Beach", zipCodes: ["33139", "33140", "33141"] },
          { name: "Coconut Grove", zipCodes: ["33133", "33134"] },
          { name: "Coral Gables", zipCodes: ["33134", "33143", "33144", "33146"] },
          { name: "Miami Beach", zipCodes: ["33139", "33140", "33141", "33154"] },
          { name: "Wynwood", zipCodes: ["33127", "33137"] },
          { name: "Design District", zipCodes: ["33127", "33137"] },
          { name: "Little Havana", zipCodes: ["33125", "33135"] },
          { name: "Aventura", zipCodes: ["33160", "33180"] },
          { name: "Key Biscayne", zipCodes: ["33149"] }
        ],
        recyclingPartners: ["Miami-Dade Recycling", "South Florida Environmental", "Tropical Mattress Recovery"],
        localRegulations: "Miami-Dade County Code Chapter 16A mandates proper disposal. Illegal dumping fines start at $250 plus disposal costs.",
        serviceNotes: "Specialized service for high-rise condos, beach properties, and gated communities throughout Greater Miami.",
        nearbyCities: [
          { name: "Fort Lauderdale", slug: "fort-lauderdale", distance: 28 },
          { name: "Hollywood", slug: "hollywood-fl", distance: 18 },
          { name: "Coral Springs", slug: "coral-springs", distance: 37 },
          { name: "Pembroke Pines", slug: "pembroke-pines", distance: 21 }
        ]
      },
      
      "orlando": {
        city: "Orlando",
        state: "Florida",
        stateSlug: "florida",
        population: 307573,
        medianIncome: 51757,
        tier: 1,
        coordinates: { lat: 28.5383, lng: -81.3792 },
        zipCodes: ["32801", "32802", "32803", "32804", "32805", "32806", "32807", "32808", "32809", "32810", "32811", "32812", "32814", "32817", "32818", "32819", "32820", "32821", "32822", "32824", "32825", "32826", "32827", "32828", "32829", "32830", "32831", "32832", "32833", "32834", "32835", "32836", "32837", "32839"],
        neighborhoods: [
          { name: "Downtown", zipCodes: ["32801", "32803"] },
          { name: "Winter Park", zipCodes: ["32789", "32790", "32792"] },
          { name: "Dr. Phillips", zipCodes: ["32819", "32836"] },
          { name: "Lake Nona", zipCodes: ["32827", "32832"] },
          { name: "College Park", zipCodes: ["32804"] },
          { name: "Thornton Park", zipCodes: ["32801", "32803"] },
          { name: "Baldwin Park", zipCodes: ["32814"] },
          { name: "Windermere", zipCodes: ["34786"] },
          { name: "Celebration", zipCodes: ["34747"] },
          { name: "International Drive", zipCodes: ["32819", "32821"] }
        ],
        recyclingPartners: ["Orange County Environmental", "Central Florida Recycling", "Orlando Waste Solutions"],
        localRegulations: "City of Orlando requires appointment for bulk waste pickup. Illegal dumping violations carry fines from $100 to $1,000.",
        serviceNotes: "Service throughout Orlando metro including theme park hotels, vacation rentals, and residential communities.",
        nearbyCities: [
          { name: "Kissimmee", slug: "kissimmee", distance: 16 },
          { name: "Winter Park", slug: "winter-park", distance: 5 },
          { name: "Altamonte Springs", slug: "altamonte-springs", distance: 10 },
          { name: "Sanford", slug: "sanford", distance: 20 }
        ]
      },
      
      "tampa": {
        city: "Tampa",
        state: "Florida",
        stateSlug: "florida",
        population: 399700,
        medianIncome: 53833,
        tier: 1,
        coordinates: { lat: 27.9506, lng: -82.4572 },
        zipCodes: ["33602", "33603", "33604", "33605", "33606", "33607", "33609", "33610", "33611", "33612", "33613", "33614", "33615", "33616", "33617", "33618", "33619", "33620", "33621", "33624", "33625", "33626", "33629", "33634", "33635", "33637", "33647"],
        neighborhoods: [
          { name: "Downtown/Channelside", zipCodes: ["33602"] },
          { name: "Ybor City", zipCodes: ["33605"] },
          { name: "Hyde Park", zipCodes: ["33606", "33609"] },
          { name: "South Tampa", zipCodes: ["33609", "33611", "33629"] },
          { name: "Westshore", zipCodes: ["33607", "33609"] },
          { name: "Carrollwood", zipCodes: ["33618", "33624", "33625"] },
          { name: "New Tampa", zipCodes: ["33647", "33637"] },
          { name: "Davis Islands", zipCodes: ["33606"] },
          { name: "Seminole Heights", zipCodes: ["33603", "33604"] },
          { name: "Brandon", zipCodes: ["33510", "33511"] }
        ],
        recyclingPartners: ["Tampa Bay Recycling", "Hillsborough Environmental", "Gulf Coast Recovery"],
        localRegulations: "Tampa's solid waste code requires scheduled pickup for large items. Fines for illegal dumping range from $50 to $1,000.",
        serviceNotes: "Complete coverage from historic Ybor City to waterfront properties and suburban communities.",
        nearbyCities: [
          { name: "St. Petersburg", slug: "st-petersburg", distance: 24 },
          { name: "Clearwater", slug: "clearwater", distance: 22 },
          { name: "Brandon", slug: "brandon", distance: 10 },
          { name: "Plant City", slug: "plant-city", distance: 23 }
        ]
      },
      
      // NEW YORK
      "new-york-city": {
        city: "New York City",
        state: "New York",
        stateSlug: "new-york",
        population: 8336817,
        medianIncome: 63998,
        tier: 1,
        coordinates: { lat: 40.7128, lng: -74.0060 },
        zipCodes: ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10009", "10010", "10011", "10012", "10013", "10014", "10016", "10017", "10018", "10019", "10021", "10022", "10023", "10024", "10025", "10026", "10027", "10028", "10029", "10030", "10031", "10032", "10033", "10034", "10035", "10036", "10037", "10038", "10039", "10040"],
        neighborhoods: [
          { name: "Manhattan - Midtown", zipCodes: ["10001", "10016", "10017", "10018", "10019", "10036"] },
          { name: "Manhattan - Upper East Side", zipCodes: ["10021", "10028", "10065", "10075"] },
          { name: "Manhattan - Upper West Side", zipCodes: ["10023", "10024", "10025", "10069"] },
          { name: "Manhattan - Downtown/Financial", zipCodes: ["10004", "10005", "10006", "10007", "10038"] },
          { name: "Manhattan - Greenwich Village", zipCodes: ["10003", "10011", "10012", "10014"] },
          { name: "Brooklyn - Park Slope", zipCodes: ["11215", "11217"] },
          { name: "Brooklyn - Williamsburg", zipCodes: ["11211", "11206", "11249"] },
          { name: "Brooklyn - Brooklyn Heights", zipCodes: ["11201"] },
          { name: "Queens - Astoria", zipCodes: ["11101", "11102", "11103", "11105", "11106"] },
          { name: "Queens - Forest Hills", zipCodes: ["11375"] }
        ],
        recyclingPartners: ["NYC Mattress Recycling", "Five Boroughs Recovery", "Metro Environmental Services"],
        localRegulations: "NYC requires appointment through 311 for bulk item pickup. Illegal dumping fines range from $100 to $10,000.",
        serviceNotes: "Specialized service for walk-ups, high-rises, and brownstones across all five boroughs.",
        nearbyCities: [
          { name: "Jersey City", slug: "jersey-city", distance: 5 },
          { name: "Newark", slug: "newark", distance: 11 },
          { name: "Yonkers", slug: "yonkers", distance: 16 },
          { name: "White Plains", slug: "white-plains", distance: 25 }
        ]
      },
      
      // ILLINOIS
      "chicago": {
        city: "Chicago",
        state: "Illinois",
        stateSlug: "illinois",
        population: 2693976,
        medianIncome: 58247,
        tier: 1,
        coordinates: { lat: 41.8781, lng: -87.6298 },
        zipCodes: ["60601", "60602", "60603", "60604", "60605", "60606", "60607", "60608", "60609", "60610", "60611", "60612", "60613", "60614", "60615", "60616", "60617", "60618", "60619", "60620", "60621", "60622", "60623", "60624", "60625", "60626", "60628", "60629", "60630", "60631", "60632", "60634", "60636", "60637", "60638", "60639", "60640", "60641", "60642", "60643", "60644", "60645", "60646", "60647", "60649", "60651", "60652", "60653", "60654", "60655", "60656", "60657", "60659", "60660", "60661", "60666"],
        neighborhoods: [
          { name: "The Loop", zipCodes: ["60601", "60602", "60603", "60604"] },
          { name: "River North", zipCodes: ["60654", "60611"] },
          { name: "Lincoln Park", zipCodes: ["60614", "60610"] },
          { name: "Wicker Park/Bucktown", zipCodes: ["60622", "60647"] },
          { name: "Gold Coast", zipCodes: ["60611"] },
          { name: "West Loop", zipCodes: ["60607", "60661"] },
          { name: "Lakeview", zipCodes: ["60613", "60657"] },
          { name: "Hyde Park", zipCodes: ["60615", "60637"] },
          { name: "Logan Square", zipCodes: ["60647", "60618"] },
          { name: "Old Town", zipCodes: ["60610", "60614"] }
        ],
        recyclingPartners: ["Chicago Mattress Recycling", "Midwest Recovery Solutions", "Great Lakes Environmental"],
        localRegulations: "Chicago requires scheduling through 311 for bulk items. Illegal dumping violations carry fines from $300 to $1,500.",
        serviceNotes: "Service from lakefront high-rises to neighborhood three-flats, including challenging walkups and vintage buildings.",
        nearbyCities: [
          { name: "Evanston", slug: "evanston", distance: 13 },
          { name: "Oak Park", slug: "oak-park", distance: 9 },
          { name: "Naperville", slug: "naperville", distance: 28 },
          { name: "Aurora", slug: "aurora-il", distance: 40 }
        ]
      },
      
      // ARIZONA
      "phoenix": {
        city: "Phoenix",
        state: "Arizona",
        stateSlug: "arizona",
        population: 1680992,
        medianIncome: 57459,
        tier: 1,
        coordinates: { lat: 33.4484, lng: -112.0740 },
        zipCodes: ["85001", "85002", "85003", "85004", "85005", "85006", "85007", "85008", "85009", "85012", "85013", "85014", "85015", "85016", "85017", "85018", "85019", "85020", "85021", "85022", "85023", "85024", "85027", "85028", "85029", "85031", "85032", "85033", "85034", "85035", "85037", "85040", "85041", "85042", "85043", "85044", "85045", "85048", "85050", "85051", "85053", "85054"],
        neighborhoods: [
          { name: "Downtown Phoenix", zipCodes: ["85003", "85004", "85006", "85007"] },
          { name: "Scottsdale", zipCodes: ["85250", "85251", "85254", "85255", "85257", "85258", "85259", "85260", "85262"] },
          { name: "Paradise Valley", zipCodes: ["85253"] },
          { name: "Arcadia", zipCodes: ["85018"] },
          { name: "Biltmore", zipCodes: ["85016"] },
          { name: "Ahwatukee", zipCodes: ["85044", "85045", "85048"] },
          { name: "North Phoenix", zipCodes: ["85022", "85023", "85024", "85027", "85028", "85029", "85032", "85050", "85053", "85054"] },
          { name: "Central Phoenix", zipCodes: ["85012", "85013", "85014", "85015"] },
          { name: "South Phoenix", zipCodes: ["85040", "85041", "85042", "85043"] },
          { name: "Deer Valley", zipCodes: ["85027", "85050", "85053", "85054", "85085", "85086", "85087"] }
        ],
        recyclingPartners: ["Phoenix Recycling Services", "Desert Mattress Recovery", "Arizona Environmental Solutions"],
        localRegulations: "Phoenix City Code 27-13 requires appointment for bulk trash. Illegal dumping fines range from $150 to $2,500.",
        serviceNotes: "Year-round service adapted for extreme heat, serving from downtown lofts to desert estates.",
        nearbyCities: [
          { name: "Mesa", slug: "mesa", distance: 19 },
          { name: "Tempe", slug: "tempe", distance: 11 },
          { name: "Glendale", slug: "glendale-az", distance: 9 },
          { name: "Chandler", slug: "chandler", distance: 22 }
        ]
      }
    },
    
    // State-level data
    states: {
      "california": {
        name: "California",
        abbreviation: "CA",
        capital: "Sacramento",
        population: 39538223,
        totalCities: 150,
        majorCities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Fresno", "Sacramento", "Long Beach", "Oakland"],
        recyclingLaw: "SB 1254 requires mattress recycling statewide with consumer fee at purchase.",
        disposalNote: "California has the nation's most comprehensive mattress recycling program."
      },
      "texas": {
        name: "Texas",
        abbreviation: "TX",
        capital: "Austin",
        population: 29145505,
        totalCities: 125,
        majorCities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
        recyclingLaw: "Local ordinances vary by city. Most major cities require proper disposal.",
        disposalNote: "Texas cities are implementing progressive recycling programs."
      },
      "florida": {
        name: "Florida",
        abbreviation: "FL",
        capital: "Tallahassee",
        population: 21538187,
        totalCities: 75,
        majorCities: ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Fort Lauderdale", "Tallahassee", "Cape Coral"],
        recyclingLaw: "County-level regulations apply. Most counties prohibit landfill disposal.",
        disposalNote: "Florida's growing population drives demand for responsible disposal."
      },
      "new-york": {
        name: "New York",
        abbreviation: "NY",
        capital: "Albany",
        population: 20201249,
        totalCities: 65,
        majorCities: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers", "New Rochelle", "Mount Vernon"],
        recyclingLaw: "EPR law pending. NYC has strict bulk item disposal requirements.",
        disposalNote: "New York leads in urban recycling initiatives."
      },
      "illinois": {
        name: "Illinois",
        abbreviation: "IL",
        capital: "Springfield",
        population: 12812508,
        totalCities: 45,
        majorCities: ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin"],
        recyclingLaw: "Local ordinances in major cities require recycling or proper disposal.",
        disposalNote: "Illinois focuses on landfill diversion and material recovery."
      },
      "arizona": {
        name: "Arizona",
        abbreviation: "AZ",
        capital: "Phoenix",
        population: 7151502,
        totalCities: 35,
        majorCities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe"],
        recyclingLaw: "City-specific bulk waste programs. Most require scheduled pickup.",
        disposalNote: "Arizona's rapid growth increases focus on sustainable disposal."
      }
    }
  };
};