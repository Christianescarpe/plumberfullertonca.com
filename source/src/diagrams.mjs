const frame = (inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 230" role="img" aria-label="${label}">
  <rect x="1" y="1" width="358" height="228" rx="14" fill="#ffffff" stroke="#e2e6ec"/>
  ${inner}
</svg>`;

export const diagrams = {
  "sewer-lateral": {
    title: "Fullerton sewer lateral, in plain sections",
    caption: "Diagram based on City of Fullerton Public Works description of a sewer lateral. Building laterals on private property connect to the municipal main. The drawing is not an engineering survey.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Who maintains which pipe</text>
      <rect x="18" y="48" width="70" height="46" rx="8" fill="#111317"/>
      <text x="53" y="76" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="12">Building</text>
      <line x1="88" y1="71" x2="150" y2="71" stroke="#65a30d" stroke-width="6" stroke-linecap="round"/>
      <text x="92" y="108" fill="#4d7c0f" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="11">To property line</text>
      <text x="92" y="124" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="11">Owner’s lateral</text>
      <line x1="168" y1="46" x2="168" y2="150" stroke="#153b6b" stroke-dasharray="4 4"/>
      <text x="174" y="58" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="11">Property line</text>
      <line x1="168" y1="71" x2="250" y2="71" stroke="#65a30d" stroke-width="8" stroke-linecap="round"/>
      <text x="176" y="108" fill="#4d7c0f" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="11">Connection</text>
      <text x="176" y="124" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="11">Street run</text>
      <rect x="258" y="56" width="82" height="30" rx="8" fill="#153b6b"/>
      <text x="299" y="76" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="12">City main</text>
      <text x="18" y="168" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Routine maintenance of private building laterals: property owner.</text>
      <text x="18" y="188" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">City of Fullerton maintains public sanitary sewer mains.</text>
      <text x="18" y="208" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="11">Wastewater conveyed to Orange County Sanitation District (OC San).</text>
    `, "Diagram of a Fullerton sewer lateral from the building to the municipal main"),
  },
  "leak-paths": {
    title: "A leak is a location question first",
    caption: "Original diagram. It separates a single fixture leak from a building supply leak. It does not inspect a particular building.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Where is the water showing up?</text>
      <rect x="18" y="48" width="150" height="70" rx="10" fill="#f8fafc" stroke="#153b6b" stroke-width="1.5"/>
      <text x="93" y="78" text-anchor="middle" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">One fixture</text>
      <text x="93" y="98" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Valve, trap, supply stop</text>
      <rect x="192" y="48" width="150" height="70" rx="10" fill="#f7fee7" stroke="#65a30d" stroke-width="1.5"/>
      <text x="267" y="78" text-anchor="middle" fill="#3f6212" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Several rooms</text>
      <text x="267" y="98" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Supply, slab, or meter</text>
      <text x="18" y="154" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Street water or a spinning meter with no indoor use:</text>
      <text x="18" y="174" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">ask whether Fullerton Water Division should see it.</text>
      <text x="18" y="204" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">This site cannot tell which case you have.</text>
    `, "Diagram contrasting a single-fixture leak with a building-wide supply leak"),
  },
  "supply-meter": {
    title: "Private supply line and the municipal water meter",
    caption: "Original diagram of the water service boundary. Fullerton Water Division delivers water to the street meter. Piping past the meter is private. Confirm meter location on site.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Water, up to the meter and after it</text>
      <rect x="18" y="58" width="90" height="36" rx="8" fill="#153b6b"/>
      <text x="63" y="81" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="12">City main</text>
      <line x1="108" y1="76" x2="168" y2="76" stroke="#153b6b" stroke-width="6"/>
      <rect x="168" y="58" width="70" height="36" rx="8" fill="#111317"/>
      <text x="203" y="81" text-anchor="middle" fill="#a8dc2c" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="12">Meter</text>
      <line x1="238" y1="76" x2="300" y2="76" stroke="#65a30d" stroke-width="6"/>
      <rect x="300" y="52" width="42" height="48" rx="6" fill="#65a30d"/>
      <text x="321" y="80" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="11">Home</text>
      <text x="18" y="128" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="12">Utility side: city water main and meter service.</text>
      <text x="18" y="150" fill="#4d7c0f" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="12">Private side: building supply piping on the property.</text>
      <text x="18" y="182" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">City water mains are not private repairs.</text>
      <text x="18" y="204" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Buried private lines require 811 utility markout before digging.</text>
    `, "Diagram of city water main, meter box, and private home plumbing"),
  },
  "heater-choice": {
    title: "Tank and tankless water heaters",
    caption: "Original diagram. It does not size a heater or guarantee energy savings. Fuel, venting, space, and local permits decide what fits.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Two configurations of water heating</text>
      <rect x="36" y="52" width="78" height="110" rx="10" fill="#f8fafc" stroke="#153b6b" stroke-width="2"/>
      <rect x="50" y="68" width="50" height="14" rx="3" fill="#e2e8f0"/>
      <text x="75" y="150" text-anchor="middle" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Storage tank</text>
      <rect x="190" y="70" width="120" height="70" rx="8" fill="#f7fee7" stroke="#65a30d" stroke-width="2"/>
      <text x="250" y="110" text-anchor="middle" fill="#3f6212" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Tankless</text>
      <text x="18" y="190" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Ask about gas supply, venting, electrical service, and permits.</text>
      <text x="18" y="210" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Fullerton municipal supply delivers unheated water.</text>
    `, "Diagram comparing a storage tank water heater and a tankless unit"),
  },
  "fixture-scope": {
    title: "Fixture work stops at the plumbing connection",
    caption: "Original diagram. Cabinetry, tile, electrical, and drywall repair are separate scopes unless a contractor's written quote explicitly includes them.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">What a plumbing quote covers</text>
      <rect x="18" y="50" width="150" height="78" rx="10" fill="#111317"/>
      <text x="93" y="84" text-anchor="middle" fill="#a8dc2c" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Plumbing scope</text>
      <text x="93" y="106" text-anchor="middle" fill="#e2e8f0" font-family="Source Sans 3, sans-serif" font-size="12">Supply, drain, valves</text>
      <rect x="186" y="50" width="156" height="78" rx="10" fill="#f8fafc" stroke="#153b6b" stroke-width="1.5"/>
      <text x="264" y="84" text-anchor="middle" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Often separate</text>
      <text x="264" y="106" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Tile, counters, drywall</text>
      <text x="18" y="160" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Remodel permits depend on the exact scope of renovation.</text>
      <text x="18" y="182" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">City of Fullerton Building &amp; Safety sets permit requirements.</text>
      <text x="18" y="208" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Customer-supplied fixtures must match existing valve rough-ins.</text>
    `, "Diagram separating plumbing fixture scope from tile and cabinet carpentry"),
  },
  "gas-boundary": {
    title: "Suspected gas is not a sales call",
    caption: "Original diagram. A suspected gas leak goes to SoCalGas or 911 from a safe location. Planned appliance lines are a different, scheduled conversation.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Two different gas situations</text>
      <rect x="18" y="48" width="156" height="86" rx="10" fill="#111317"/>
      <text x="96" y="80" text-anchor="middle" fill="#a8dc2c" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Smell or hiss</text>
      <text x="96" y="102" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-size="12">Leave. Call SoCalGas</text>
      <text x="96" y="118" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-size="12">or 911. Not a referral.</text>
      <rect x="188" y="48" width="154" height="86" rx="10" fill="#f8fafc" stroke="#153b6b" stroke-width="1.5"/>
      <text x="265" y="80" text-anchor="middle" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Planned piping</text>
      <text x="265" y="102" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Appliance rough-in,</text>
      <text x="265" y="118" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">permit, inspection</text>
      <text x="18" y="168" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Do not test suspected gas leaks with matches or switches.</text>
      <text x="18" y="190" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">SoCalGas 24-hr emergency: (800) 427-2200.</text>
      <text x="18" y="212" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Always call 811 before trenching or yard excavation.</text>
    `, "Diagram separating a suspected gas emergency from planned appliance piping"),
  },
  "commercial-auth": {
    title: "Commercial calls start with building authority",
    caption: "Original diagram. A referred contractor needs to know who can authorize the repair, the property category, and tenant access windows.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Before a commercial plumbing dispatch</text>
      <rect x="18" y="52" width="100" height="64" rx="8" fill="#111317"/>
      <text x="68" y="80" text-anchor="middle" fill="#a8dc2c" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="12">Who may</text>
      <text x="68" y="98" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-size="12">approve</text>
      <rect x="130" y="52" width="100" height="64" rx="8" fill="#153b6b"/>
      <text x="180" y="80" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="12">Fixture &amp;</text>
      <text x="180" y="98" text-anchor="middle" fill="#cbd5e1" font-family="Source Sans 3, sans-serif" font-size="12">system</text>
      <rect x="242" y="52" width="100" height="64" rx="8" fill="#65a30d"/>
      <text x="292" y="80" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="12">Hours &amp;</text>
      <text x="292" y="98" text-anchor="middle" fill="#f7fee7" font-family="Source Sans 3, sans-serif" font-size="12">entry</text>
      <text x="18" y="154" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Multi-tenant stacks require property manager coordination.</text>
      <text x="18" y="176" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Grease interceptors and commercial boilers require specialized techs.</text>
      <text x="18" y="206" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Acceptance is verified on the intake call, not by this page.</text>
    `, "Diagram of commercial plumbing questions: authority, fixture, and access"),
  },
  "treatment-scope": {
    title: "Water treatment is an option, not a health scare",
    caption: "Original diagram. Fullerton tap water is drawn from the local OCWD groundwater basin and MWD imported supplies. Hardness is a mineral property, not a sign of water contamination.",
    svg: frame(`
      <text x="18" y="28" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Hardness is a mineral description</text>
      <rect x="18" y="50" width="324" height="36" rx="8" fill="#153b6b"/>
      <text x="180" y="73" text-anchor="middle" fill="#ffffff" font-family="Source Sans 3, sans-serif" font-weight="600" font-size="13">Municipal water: moderately hard to hard mineral profile</text>
      <rect x="18" y="102" width="154" height="58" rx="8" fill="#f8fafc" stroke="#153b6b" stroke-width="1.5"/>
      <text x="95" y="126" text-anchor="middle" fill="#153b6b" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Scale &amp; spots</text>
      <text x="95" y="146" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Appliance maintenance</text>
      <rect x="186" y="102" width="156" height="58" rx="8" fill="#f7fee7" stroke="#65a30d" stroke-width="1.5"/>
      <text x="264" y="126" text-anchor="middle" fill="#3f6212" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="13">Softener or filter</text>
      <text x="264" y="146" text-anchor="middle" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Optional property choice</text>
      <text x="18" y="186" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Salt-based water softeners add sodium ions; consult a doctor if on low-sodium diet.</text>
      <text x="18" y="208" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">This website does not test or certify private water quality.</text>
    `, "Diagram separating water mineral scale from optional softener equipment"),
  },
  "district-groups": {
    title: "Six editorial Fullerton groupings",
    caption: "Original diagram of the six Fullerton area groupings used on this website. They are editorial geographic clusters, not official voting or utility districts.",
    svg: frame(`
      <text x="18" y="26" fill="#111317" font-family="Source Sans 3, sans-serif" font-weight="700" font-size="15">Fullerton area groupings on this site</text>
      <rect x="18" y="42" width="104" height="36" rx="6" fill="#111317"/><text x="70" y="65" text-anchor="middle" fill="#a8dc2c" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">Downtown / Central</text>
      <rect x="128" y="42" width="104" height="36" rx="6" fill="#153b6b"/><text x="180" y="65" text-anchor="middle" fill="#ffffff" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">Sunny Hills / North</text>
      <rect x="238" y="42" width="104" height="36" rx="6" fill="#65a30d"/><text x="290" y="65" text-anchor="middle" fill="#ffffff" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">Amerige / West</text>
      <rect x="18" y="86" width="104" height="36" rx="6" fill="#153b6b"/><text x="70" y="109" text-anchor="middle" fill="#ffffff" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">East Fullerton / CSUF</text>
      <rect x="128" y="86" width="104" height="36" rx="6" fill="#65a30d"/><text x="180" y="109" text-anchor="middle" fill="#ffffff" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">Raymond / Golden</text>
      <rect x="238" y="86" width="104" height="36" rx="6" fill="#111317"/><text x="290" y="109" text-anchor="middle" fill="#a8dc2c" font-weight="600" font-size="10" font-family="Source Sans 3, sans-serif">South / Valencia</text>
      <text x="18" y="150" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Four primary residential ZIP sections: 92831, 92832, 92833, and 92835.</text>
      <text x="18" y="172" fill="#14171c" font-family="Source Sans 3, sans-serif" font-size="12">Brea, Placentia, Anaheim, Buena Park, and La Habra are separate cities.</text>
      <text x="18" y="202" fill="#475569" font-family="Source Sans 3, sans-serif" font-size="12">Editorial map for problem routing. Not a legal service boundary.</text>
    `, "Diagram listing six editorial Fullerton district groupings"),
  },
};
