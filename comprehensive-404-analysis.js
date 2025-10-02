const fs = require('fs');
const path = require('path');

// Your complete 404 URLs from the list
const urls404 = [
  'https://abedderworld.com/low-bed-frames.html/',
  'https://abedderworld.com/what-mattress-does-marriott-use-where-to-buy-it.html/',
  'https://abedderworld.com/best-bed-frame-for-a-sleep-number-mattress.html/',
  'https://abedderworld.com/alaskan-king-bed-5-places-to-buy-one-online.html/',
  'https://abedderworld.com/best-short-queen-mattress.html/',
  'https://abedderworld.com/duvet-inserts.html/',
  'https://abedderworld.com/fort-collins-mattress-disposal.html',
  'https://abedderworld.com/Surprise-AZ/',
  'https://abedderworld.com/dormeo-mattress-topper-reviewed-tested.html/',
  'https://abedderworld.com/best-rv-bunk-mattresses.html/',
  'https://abedderworld.com/best-super-single-mattress.html/',
  'https://abedderworld.com/how-to-make-a-couch-from-a-twin-mattress.html/',
  'https://abedderworld.com/all-you-need-to-know-about-polyester-is-it-safe-or-toxic.html/',
  'https://abedderworld.com/queen-daybed.html/',
  'https://abedderworld.com/best-10-inch-thick-mattress-options.html/',
  'https://abedderworld.com/upholstered-bed-frames.html/',
  'https://abedderworld.com/metal-adjustable-bed-frame.html/',
  'https://abedderworld.com/family-bed.html/',
  'https://abedderworld.com/japanese-joinery-bed-frames.html/',
  'https://abedderworld.com/best-olympic-queen-mattresses.html/',
  'https://abedderworld.com/cot-mattress.html/',
  'https://abedderworld.com/texas-king-bed.html/',
  'https://abedderworld.com/Maricopa-AZ/',
  'https://abedderworld.com/how-to-wash-a-tempurpedic-pillow.html/',
  'https://abedderworld.com/best-bed-frames-for-a-casper-mattress.html/',
  'https://abedderworld.com/how-to-tie-a-mattress-to-your-car.html/',
  'https://abedderworld.com/walmart-mattress-buyers-guide.html/',
  'https://abedderworld.com/best-three-quarter-mattresses-to-buy-online.html/',
  'https://abedderworld.com/how-much-does-it-cost-to-ship-a-mattress.html/',
  'https://abedderworld.com/what-mattress-does-marriott-use-where-to-buy-it.html/',
  'https://abedderworld.com/why-does-my-leg-hurt-when-i-wake-up.html/',
  'https://abedderworld.com/East-Lansing-MI/',
  'https://abedderworld.com/what-mattress-does-holiday-inn-use.html/',
  'https://abedderworld.com/bed-sore-creams.html/',
  'https://abedderworld.com/how-to-fix-a-sagging-mattress.html/',
  'https://abedderworld.com/extra-firm-mattress-topper.html',
  'https://abedderworld.com/can-you-place-mattresses-on-top-of-another-mattress.html/',
  'https://abedderworld.com/best-wool-mattress-pads-toppers.html/',
  'https://abedderworld.com/8-inch-vs-10-inch-thick-mattress.html/',
  'https://abedderworld.com/bed-lift.html/',
  'https://abedderworld.com/top-4-sofa-bed-mattress-replacement-options.html/',
  'https://abedderworld.com/how-to-dry-a-mattress.html/',
  'https://abedderworld.com/air-mattress-sheets-a-complete-buyer-guide.html/',
  'https://abedderworld.com/tips-to-fix-an-air-bed-that-keeps-losing-air-or-deflates.html/',
  'https://abedderworld.com/airstream-replacement-mattress.html/',
  'https://abedderworld.com/best-bed-frames-for-a-memory-foam-mattress.html/',
  'https://abedderworld.com/how-to-fix-a-squeaky-bed-frame.html/',
  'https://abedderworld.com/most-expensive-mattresses.html/',
  'https://abedderworld.com/best-trundle-bed-mattress.html/',
  'https://abedderworld.com/Dublin-OH/',
  'https://abedderworld.com/how-to-attach-a-headboard-to-a-bed-frame.html/',
  'https://www.abedderworld.com/stratton-oh/',
  'https://abedderworld.com/copper-infused-mattress.html/',
  'https://www.abedderworld.com/mercersville-md/',
  'https://abedderworld.com/sleeping-with-your-feet-elevated.html/',
  'https://abedderworld.com/best-bed-frame-for-purple-mattress.html/',
  'https://abedderworld.com/air-mattress-topper.html/',
  'https://abedderworld.com/the-best-smart-bed-frames-smart-mattresses.html/',
  'https://abedderworld.com/renting-a-mattress.html/',
  'https://abedderworld.com/eco-friendly-bed-frame.html/',
  'https://abedderworld.com/how-to-sleep-after-meniscus-surgery.html/',
  'https://abedderworld.com/best-low-profile-box-spring.html/',
  'https://abedderworld.com/mattress-for-neuropathy.html/',
  'https://abedderworld.com/tall-bed-frame.html/',
  'https://abedderworld.com/mattress-vacuums.html/',
  'https://www.abedderworld.com/blossburg-mt/',
  'https://abedderworld.com/can-you-use-plywood-instead-of-a-bunkie-board.html/',
  'https://abedderworld.com/how-to-cut-a-memory-foam-mattress.html/',
  'https://www.abedderworld.com/chester-id/',
  'https://abedderworld.com/european-mattress-sizes.html/',
  'https://www.abedderworld.com/east-naples-fl/',
  'https://abedderworld.com/best-mattress-for-osteoporosis.html/',
  'https://abedderworld.com/fold-up-bed.html/',
  'https://www.abedderworld.com/estherwood-la/',
  'https://abedderworld.com/teenage-bed-frames.html/',
  'https://abedderworld.com/murphy-bed-mattress.html/',
  'https://abedderworld.com/4-best-bunkie-boards.html/',
  'https://www.abedderworld.com/democrat-tx/',
  'https://abedderworld.com/vickery-oh',
  'https://abedderworld.com/garland-ut',
  'https://abedderworld.com/wyoming-king-bed.html/',
  'https://abedderworld.com/the-best-mattress-for-a-tall-person.html/',
  'https://www.abedderworld.com/radium-mn/',
  'https://www.abedderworld.com/kinross-mi/',
  'https://abedderworld.com/best-mattress-for-spondylolisthesis.html/',
  'https://abedderworld.com/king-size-bed-frame-with-headboard.html/',
  'https://abedderworld.com/best-mattress-for-bed-sores-pressure-ulcers.html/',
  'https://abedderworld.com/bellefontaine-al',
  'https://abedderworld.com/top-chiropractor-recommended-mattresses.html/',
  'https://abedderworld.com/best-donut-pillow.html/',
  'https://abedderworld.com/jefferson-ok',
  'https://abedderworld.com/furley-ks',
  'https://abedderworld.com/grayson-mo',
  'https://abedderworld.com/best-ikea-mattresses.html/',
  'https://abedderworld.com/best-full-xl-mattresses.html/',
  'https://abedderworld.com/mount-trumbull-az',
  'https://abedderworld.com/vibrating-bed-frames.html/',
  'https://abedderworld.com/stratton-oh/',
  'https://abedderworld.com/fairbank-md',
  'https://abedderworld.com/bernard-ia',
  'https://abedderworld.com/mattress-without-memory-foam.html/',
  'https://abedderworld.com/how-to-return-a-mattress-to-amazon.html/',
  'https://abedderworld.com/how-to-get-a-mattress-back-in-its-box.html/',
  'https://abedderworld.com/is-it-illegal-to-sell-a-used-mattress-state-by-state-guide.html/',
  'https://abedderworld.com/can-you-put-an-air-mattress-on-a-bed-frame.html/',
  'https://abedderworld.com/best-pocketed-coil-mattress.html/',
  'https://abedderworld.com/what-cheer-ia',
  'https://abedderworld.com/avoca-ne',
  'https://abedderworld.com/dryer-sheets-for-bed-bugs.html/',
  'https://abedderworld.com/the-russian-sleep-experiment.html/',
  'https://abedderworld.com/best-pack-n-play-mattress.html/',
  'https://abedderworld.com/vibe-mattress-review.html/',
  'https://abedderworld.com/husband-pillow.html/',
  'https://www.abedderworld.com/tarry-ar/',
  'https://abedderworld.com/how-to-put-together-a-bed-frame.html/',
  'https://abedderworld.com/best-mattress-for-hypermobility.html/',
  'https://abedderworld.com/nuzzle-pillow-review.html/',
  'https://abedderworld.com/do-two-twin-beds-together-make-a-king.html/',
  'https://abedderworld.com/water-pillow-complete-guide.html/',
  'https://abedderworld.com/25-bed-frames-you-can-use-without-a-box-spring.html/',
  'https://www.abedderworld.com/green-valley-sd/',
  'https://abedderworld.com/best-van-mattress.html/',
  'https://abedderworld.com/how-to-sleep-with-broken-ribs.html/',
  'https://abedderworld.com/nzvz-8/',
  'https://abedderworld.com/tres-piedras-nm',
  'https://abedderworld.com/carlisle-mn',
  'https://abedderworld.com/calhoun-il',
  'https://www.abedderworld.com/kulm-nd/',
  'https://abedderworld.com/tempur-pedic-bed-frame.html/',
  'https://abedderworld.com/twin-to-king-daybed.html/',
  'https://abedderworld.com/greenfield-il',
  'https://abedderworld.com/trundle-beds.html/',
  'https://abedderworld.com/norbourne-estates-ky',
  'https://abedderworld.com/mattress-for-a-disabled-person.html/',
  'https://www.abedderworld.com/carbon-in/',
  'https://abedderworld.com/mattress-tags.html/',
  'https://www.abedderworld.com/maxville-mt/',
  'https://abedderworld.com/how-to-move-a-mattress-alone.html/',
  'https://abedderworld.com/dakimakura-pillow.html/',
  'https://abedderworld.com/extra-firm-mattress-topper.html/',
  'https://abedderworld.com/rowland-heights-ca/',
  'https://abedderworld.com/brands-that-have-fiberglass-mattresses.html/',
  'https://www.abedderworld.com/candler-fl/',
  'https://abedderworld.com/texas-king-bed.html/?utm_source=chatgpt.com',
  'https://abedderworld.com/queen-trundle-bed.html/',
  'https://abedderworld.com/how-to-get-a-mattress-back-in-its-box.html/',
  'https://abedderworld.com/best-mattress-topper-for-heavy-person.html/',
  'https://www.abedderworld.com/doyle-ga/',
  'https://www.abedderworld.com/witter-ar/',
  'https://abedderworld.com/wall-mounted-headboard.html/',
  'https://abedderworld.com/futon-mattresses.html/',
  'https://abedderworld.com/sand-hill-pa',
  'https://abedderworld.com/coccyx-pillow.html/',
  'https://abedderworld.com/mattress-removal/georgia/valdosta/',
  'https://abedderworld.com/stilesville-in',
  'https://abedderworld.com/gilman-mt',
  'https://abedderworld.com/de-kalb-mo',
  'https://abedderworld.com/toughkenamon-pa',
  'https://www.abedderworld.com/kinderhook-ny/',
  'https://abedderworld.com/mens-bed-frames.html/',
  'https://abedderworld.com/standard-height-of-a-bed-frame-and-mattress.html/',
  'https://abedderworld.com/truck-bed-mattress.html/',
  'https://abedderworld.com/triumph-il',
  'https://www.abedderworld.com/muir-mi/',
  'https://www.abedderworld.com/summerville-pa/',
  'https://abedderworld.com/new-hartford-ia',
  'https://www.abedderworld.com/milleville-beach-mi/',
  'https://www.abedderworld.com/jameson-mo/',
  'https://abedderworld.com/westbend-ky',
  'https://abedderworld.com/the-russian-sleep-experiment.html/',
  'https://abedderworld.com/best-bed-frame-for-a-latex-mattress.html/',
  'https://abedderworld.com/is-it-illegal-to-sell-a-used-mattress-state-by-state-guide.html',
  'https://abedderworld.com/truck-bed-mattress.html/',
  'https://abedderworld.com/best-co-sleeping-mattresses-for-bed-sharing.html/',
  'https://abedderworld.com/half-moon-nc',
  'https://abedderworld.com/watford-city-nd',
  'https://www.abedderworld.com/keatchie-la/',
  'https://www.abedderworld.com/pekin-nd/',
  'https://abedderworld.com/black-bed-frame.html/',
  'https://abedderworld.com/summerland-key-fl',
  'https://abedderworld.com/uehling-ne',
  'https://www.abedderworld.com/elk-city-id/',
  'https://abedderworld.com/eatons-neck-ny',
  'https://abedderworld.com/clear-lake-il',
  'https://www.abedderworld.com/shiloh-nc/',
  'https://abedderworld.com/rome-city-in',
  'https://abedderworld.com/tazewell-tn',
  'https://abedderworld.com/minimalist-bed-frame.html/',
  'https://abedderworld.com/how-to-sell-used-mattresses.html/',
  'https://abedderworld.com/pottawattamie-park-in',
  'https://abedderworld.com/chauncey-ga',
  'https://abedderworld.com/osyka-ms',
  'https://www.abedderworld.com/marshallville-oh/',
  'https://abedderworld.com/best-van-tents-that-attach-to-the-top-of-your-van.html/',
  'https://abedderworld.com/lakeland-mo',
  'https://www.abedderworld.com/wendell-id/',
  'https://abedderworld.com/murray-ne',
  'https://abedderworld.com/drum-point-md',
  'https://abedderworld.com/a-sagging-mattresses-vs-mattress-body-impressions.html/',
  'https://abedderworld.com/shrsl-35/',
  'https://abedderworld.com/twin-memory-foam-mattress.html/',
  'https://abedderworld.com/woodlawn-beach-fl',
  'https://www.abedderworld.com/hopper-ar/',
  'https://www.abedderworld.com/vallonia-in/',
  'https://abedderworld.com/deep-springs-ca',
  'https://abedderworld.com/burt-ia',
  'https://abedderworld.com/cal-king-mattress-topper.html/',
  'https://abedderworld.com/bed-slats.html/',
  'https://abedderworld.com/waterloo-or',
  'https://abedderworld.com/westpoint-tn',
  'https://www.abedderworld.com/chatsworth-ia/',
  'https://www.abedderworld.com/oak-grove-tn/',
  'https://abedderworld.com/ruthville-nd',
  'https://www.abedderworld.com/napeague-ny/',
  'https://abedderworld.com/water-bed-online-buyer-guide.html/',
  'https://abedderworld.com/rock-springs-az',
  'https://abedderworld.com/wenatchee-wa',
  'https://abedderworld.com/sweden-valley-pa',
  'https://abedderworld.com/price-ut',
  'https://abedderworld.com/waverly-fl',
  'https://www.abedderworld.com/ericsburg-mn/',
  'https://abedderworld.com/aurora-ky',
  'https://abedderworld.com/best-mattress-for-an-adjustable-bed.html/',
  'https://abedderworld.com/sulphur-ok',
  'https://abedderworld.com/yorketown-nj',
  'https://abedderworld.com/truck-bed-mattress.html',
  'https://abedderworld.com/crab-orchard-ky',
  'https://abedderworld.com/tatami-mat.html/',
  'https://abedderworld.com/japanese-sleep-guide.html/',
  'https://abedderworld.com/raymond-ca',
  'https://abedderworld.com/shrsl-45/',
  'https://abedderworld.com/longview-ms',
  'https://abedderworld.com/bed-frame-cover.html/',
  'https://abedderworld.com/viola-ca',
  'https://abedderworld.com/best-mattress-for-a-smaller-lightweight-skinny-person.html/',
  'https://abedderworld.com/cook-ne',
  'https://abedderworld.com/schiller-park-il',
  'https://abedderworld.com/trebloc-ms',
  'https://abedderworld.com/parma-oh',
  'https://abedderworld.com/westtown-pa',
  'https://abedderworld.com/maxbass-nd',
  'https://abedderworld.com/holcut-ms',
  'https://abedderworld.com/bloomville-ny',
  'https://abedderworld.com/bunk-beds-sizes-and-dimensions.html/',
  'https://abedderworld.com/mid-century-modern-bed-frame.html/',
  'https://abedderworld.com/shrsl-36/',
  'https://www.abedderworld.com/bylas-az/',
  'https://abedderworld.com/floor-sofa.html/',
  'https://abedderworld.com/diamond-mo',
  'https://abedderworld.com/twin-pillow-top-mattress.html/',
  'https://abedderworld.com/charco-tx',
  'https://abedderworld.com/trimble-co',
  'https://www.abedderworld.com/de-ann-ar/',
  'https://abedderworld.com/jacksonville-mattress-disposal.html/',
  'https://abedderworld.com/mattress-for-a-disabled-person.html/'
];

// State abbreviations to full names mapping
const stateAbbreviations = {
  'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
  'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
  'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
  'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
  'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi', 'mo': 'missouri',
  'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new-hampshire', 'nj': 'new-jersey',
  'nm': 'new-mexico', 'ny': 'new-york', 'nc': 'north-carolina', 'nd': 'north-dakota', 'oh': 'ohio',
  'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode-island', 'sc': 'south-carolina',
  'sd': 'south-dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont',
  'va': 'virginia', 'wa': 'washington', 'wv': 'west-virginia', 'wi': 'wisconsin', 'wy': 'wyoming'
};

// Major city to state mapping for quick reference
const majorCities = {
  'surprise': 'arizona',
  'maricopa': 'arizona',
  'dublin': 'ohio',
  'east-lansing': 'michigan',
  'fort-collins': 'colorado',
  'jacksonville': 'florida',
  'stratton': 'ohio',
  'mercersville': 'maryland',
  'blossburg': 'montana',
  'chester': 'idaho',
  'east-naples': 'florida',
  'estherwood': 'louisiana',
  'democrat': 'texas',
  'vickery': 'ohio',
  'garland': 'utah',
  'radium': 'minnesota',
  'kinross': 'michigan',
  'bellefontaine': 'alabama',
  'jefferson': 'oklahoma',
  'furley': 'kansas',
  'grayson': 'missouri',
  'mount-trumbull': 'arizona',
  'fairbank': 'maryland',
  'bernard': 'iowa',
  'what-cheer': 'iowa',
  'avoca': 'nebraska',
  'tarry': 'arkansas',
  'green-valley': 'south-dakota',
  'tres-piedras': 'new-mexico',
  'carlisle': 'minnesota',
  'calhoun': 'illinois',
  'kulm': 'north-dakota',
  'greenfield': 'illinois',
  'norbourne-estates': 'kentucky',
  'carbon': 'indiana',
  'maxville': 'montana',
  'rowland-heights': 'california',
  'candler': 'florida',
  'doyle': 'georgia',
  'witter': 'arkansas',
  'sand-hill': 'pennsylvania',
  'valdosta': 'georgia',
  'stilesville': 'indiana',
  'gilman': 'montana',
  'de-kalb': 'missouri',
  'toughkenamon': 'pennsylvania',
  'kinderhook': 'new-york',
  'triumph': 'illinois',
  'muir': 'michigan',
  'summerville': 'pennsylvania',
  'new-hartford': 'iowa',
  'milleville-beach': 'michigan',
  'jameson': 'missouri',
  'westbend': 'kentucky',
  'half-moon': 'north-carolina',
  'watford-city': 'north-dakota',
  'keatchie': 'louisiana',
  'pekin': 'north-dakota',
  'summerland-key': 'florida',
  'uehling': 'nebraska',
  'elk-city': 'idaho',
  'eatons-neck': 'new-york',
  'clear-lake': 'illinois',
  'shiloh': 'north-carolina',
  'rome-city': 'indiana',
  'tazewell': 'tennessee',
  'pottawattamie-park': 'indiana',
  'chauncey': 'georgia',
  'osyka': 'mississippi',
  'marshallville': 'ohio',
  'lakeland': 'missouri',
  'wendell': 'idaho',
  'murray': 'nebraska',
  'drum-point': 'maryland',
  'woodlawn-beach': 'florida',
  'hopper': 'arkansas',
  'vallonia': 'indiana',
  'deep-springs': 'california',
  'burt': 'iowa',
  'waterloo': 'oregon',
  'westpoint': 'tennessee',
  'chatsworth': 'iowa',
  'oak-grove': 'tennessee',
  'ruthville': 'north-dakota',
  'napeague': 'new-york',
  'rock-springs': 'arizona',
  'wenatchee': 'washington',
  'sweden-valley': 'pennsylvania',
  'price': 'utah',
  'waverly': 'florida',
  'ericsburg': 'minnesota',
  'aurora': 'kentucky',
  'sulphur': 'oklahoma',
  'yorketown': 'new-jersey',
  'crab-orchard': 'kentucky',
  'raymond': 'california',
  'longview': 'mississippi',
  'viola': 'california',
  'cook': 'nebraska',
  'schiller-park': 'illinois',
  'trebloc': 'mississippi',
  'parma': 'ohio',
  'westtown': 'pennsylvania',
  'maxbass': 'north-dakota',
  'holcut': 'mississippi',
  'bloomville': 'new-york',
  'bylas': 'arizona',
  'diamond': 'missouri',
  'charco': 'texas',
  'trimble': 'colorado',
  'de-ann': 'arkansas'
};

// Blog posts that exist
const blogPosts = [
  'standard-height-of-a-bed-frame-and-mattress',
  'can-you-flip-a-pillow-top-mattress',
  'can-you-wash-a-bamboo-pillow',
  'how-to-tie-a-mattress-to-your-car',
  'how-to-fix-a-squeaky-bed-frame',
  'can-you-place-mattresses-on-top-of-another-mattress',
  'make-your-mattress-softer',
  'what-happens-when-you-spray-rubbing-alcohol-on-your-mattress',
  'how-to-find-hole-in-air-mattress-2-methods',
  'mattress-vacuums',
  'get-rid-of-a-mattress-by-throwing-it-in-the-dumpster',
  'how-long-can-you-leave-a-memory-foam-mattress-in-the-box',
  'dryer-sheets-for-bed-bugs',
  'what-happens-if-you-sleep-on-memory-foam-mattress-before-24-hours',
  'is-a-bed-in-a-box-worth-it',
  'bed-bugs-in-pillow',
  'how-to-sell-used-mattresses',
  'memory-foam-mattress-cause-back-pain',
  'make-your-mattress-last-longer',
  'how-to-fix-a-sagging-mattress',
  'worn-out-box-springs',
  'how-to-get-a-mattress-back-in-its-box',
  'how-much-does-a-mattress-weigh',
  'what-mattress-does-marriott-use-where-to-buy-it',
  'how-to-dry-a-mattress',
  'how-much-does-it-cost-to-ship-a-mattress',
  'how-to-cut-a-memory-foam-mattress',
  'a-sagging-mattresses-vs-mattress-body-impressions',
  'what-mattress-does-holiday-inn-use',
  'airstream-replacement-mattress',
  'brands-that-have-fiberglass-mattresses',
  'european-mattress-sizes',
  'how-long-does-it-take-a-memory-foam-mattress-to-expand',
  'how-to-clean-a-futon-mattress',
  'how-to-keep-a-mattress-topper-from-sliding',
  'top-4-sofa-bed-mattress-replacement-options',
  'tips-to-fix-an-air-bed-that-keeps-losing-air-or-deflates',
  'is-it-illegal-to-sell-a-used-mattress-state-by-state-guide',
  'how-to-return-a-mattress-to-amazon',
  'how-to-reinforce-a-bed-frame',
  'how-to-put-together-a-bed-frame',
  'how-to-move-a-mattress-alone',
  'how-to-make-a-couch-from-a-twin-mattress',
  'mold-on-a-mattress',
  'how-much-does-mattress-removal-cost-price-of-5-popular-services',
  'mattress-tags'
];

// Service content that exists in root
const serviceContent = [
  'fort-collins-mattress-disposal',
  'jacksonville-mattress-disposal',
  'phoenix-mattress-disposal',
  'las-vegas-mattress-disposal',
  'tucson-mattress-disposal',
  'portland-or-mattress-disposal',
  'laredo-tx-mattress-disposal-options',
  'dallas-mattress-disposal-options',
  'fort-lauderdale-mattress-disposal',
  'bed-frame-disposal',
  'futon-disposal',
  'how-to-recycle-a-mattress',
  'how-to-recycle-a-box-spring',
  'how-to-get-rid-of-a-couch',
  'how-to-get-rid-of-a-box-spring',
  'diy-couch-recycling',
  'does-goodwill-take-mattresses-4-alternative-options',
  'does-salvation-army-take-mattresses'
];

function extractPageName(url) {
  let path = url.replace('https://abedderworld.com/', '').replace('https://www.abedderworld.com/', '');
  if (path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

function parseLocationURL(url) {
  const cleanUrl = extractPageName(url);

  // Pattern 1: /City-ST/ format (capitalized)
  const cityStateMatch = cleanUrl.match(/^([A-Za-z-]+)-([A-Z]{2})$/);
  if (cityStateMatch) {
    return {
      type: 'city-state',
      city: cityStateMatch[1].toLowerCase().replace(/\s+/g, '-'),
      state: cityStateMatch[2].toLowerCase()
    };
  }

  // Pattern 2: simple city name
  const simpleCityMatch = cleanUrl.match(/^([a-z-]+)$/);
  if (simpleCityMatch && !cleanUrl.includes('.html') && majorCities[simpleCityMatch[1]]) {
    return {
      type: 'city-only',
      city: simpleCityMatch[1],
      state: majorCities[simpleCityMatch[1]]
    };
  }

  return null;
}

function checkServiceContent(pageName) {
  const cleanName = pageName.replace('.html/', '').replace('.html', '');
  return serviceContent.find(service => cleanName === service);
}

function checkBlogPost(pageName) {
  const cleanName = pageName.replace('.html/', '').replace('.html', '');
  return blogPosts.find(post => cleanName === post);
}

function isServiceRelated(pageName) {
  return pageName.includes('mattress-disposal') ||
         pageName.includes('mattress-removal') ||
         pageName.includes('disposal') ||
         pageName.includes('recycling') ||
         pageName.includes('get-rid-of');
}

function analyzeUrls() {
  console.log('Starting comprehensive 404 URL analysis...');
  const results = [];

  urls404.forEach(url => {
    const pageName = extractPageName(url);
    let recommendation = null;

    // Check for exact service content match
    const serviceMatch = checkServiceContent(pageName);
    if (serviceMatch) {
      recommendation = {
        old_url: url,
        new_url: `/${serviceMatch}/`,
        redirect_type: '301',
        category: 'service',
        priority: 'high',
        notes: 'exact service match'
      };
    }

    // Check for blog post match
    else {
      const blogMatch = checkBlogPost(pageName);
      if (blogMatch) {
        recommendation = {
          old_url: url,
          new_url: `/blog/${blogMatch}/`,
          redirect_type: '301',
          category: 'blog',
          priority: 'medium',
          notes: 'exact blog match'
        };
      }
    }

    // Check for location match
    if (!recommendation) {
      const locationInfo = parseLocationURL(url);
      if (locationInfo) {
        let targetUrl = null;
        let notes = '';

        if (locationInfo.type === 'city-state') {
          const { city, state } = locationInfo;
          const fullStateName = stateAbbreviations[state];

          if (fullStateName) {
            // For now, redirect to state page (would need full location data for exact matches)
            targetUrl = `/mattress-removal/${fullStateName}/`;
            notes = `${city} -> ${fullStateName} state page`;
          }
        }
        else if (locationInfo.type === 'city-only') {
          const { city, state } = locationInfo;
          targetUrl = `/mattress-removal/${state}/`;
          notes = `${city} -> ${state} state page`;
        }

        if (targetUrl) {
          recommendation = {
            old_url: url,
            new_url: targetUrl,
            redirect_type: '301',
            category: 'location',
            priority: 'high',
            notes: notes
          };
        }
      }
    }

    // Only include service-related content and skip shopping/review articles
    if (recommendation && (
      recommendation.category === 'service' ||
      recommendation.category === 'location' ||
      (recommendation.category === 'blog' && isServiceRelated(pageName))
    )) {
      results.push(recommendation);
    }
  });

  return results;
}

function generateCSV(results) {
  const headers = ['old_url', 'new_url', 'redirect_type', 'category', 'priority', 'notes'];
  const csvLines = [headers.join(',')];

  results.forEach(result => {
    const line = headers.map(header => `"${result[header] || ''}"`).join(',');
    csvLines.push(line);
  });

  return csvLines.join('\n');
}

// Run analysis
const results = analyzeUrls();
const csv = generateCSV(results);

console.log(`Found ${results.length} service-related redirects`);
console.log('\nBreakdown by category:');
const categories = {};
results.forEach(r => {
  categories[r.category] = (categories[r.category] || 0) + 1;
});
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`${cat}: ${count}`);
});

console.log('\nSample results:');
results.slice(0, 10).forEach(r => {
  console.log(`${r.old_url} -> ${r.new_url} (${r.category})`);
});

// Write CSV file
fs.writeFileSync('/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/comprehensive-404-redirects.csv', csv);
console.log('\nCSV file created: comprehensive-404-redirects.csv');