export const services = [
  ["Drain cleaning", "/services/drain-cleaning/"],
  ["Sewer repair", "/services/sewer-repair/"],
  ["Leak detection", "/services/leak-detection/"],
  ["Pipes and water lines", "/services/pipe-water-line-repair/"],
  ["Water heaters", "/services/water-heaters/"],
  ["Fixtures and remodels", "/services/fixtures-remodel-plumbing/"],
  ["Gas lines", "/services/gas-line-plumbing/"],
  ["Commercial", "/services/commercial-plumbing/"],
  ["Specialty", "/services/specialty-plumbing/"],
];

export const districts = [
  ["Downtown and Central", "/areas/downtown-central-fullerton/"],
  ["Sunny Hills and North", "/areas/sunny-hills-north-fullerton/"],
  ["Amerige Heights and West", "/areas/amerige-heights-west-fullerton/"],
  ["East Fullerton and CSUF", "/areas/east-fullerton-csuf/"],
  ["Raymond Hills and Golden Hill", "/areas/raymond-hills-golden-hill/"],
  ["South Fullerton and Valencia Mesa", "/areas/south-fullerton-valencia-mesa/"],
];

export const cities = [
  ["Brea", "/areas/brea/"],
  ["Placentia", "/areas/placentia/"],
  ["Anaheim", "/areas/anaheim/"],
  ["Buena Park", "/areas/buena-park/"],
  ["La Habra", "/areas/la-habra/"],
];

export const primaryNav = [
  ["Services", "/services/"],
  ["Areas", "/areas/"],
  ["Guides", "/plumbing-guides/"],
  ["How referrals work", "/how-referrals-work/"],
  ["About", "/about/"],
  ["Contact", "/contact/"],
];

export function crumbFor(path, crumbLabel) {
  if (path === "/") return [];
  const crumbs = [["Home", "/"]];
  if (path.startsWith("/services/")) {
    crumbs.push(["Services", "/services/"]);
    if (path !== "/services/") crumbs.push([crumbLabel, path]);
  } else if (path.startsWith("/areas/")) {
    crumbs.push(["Areas", "/areas/"]);
    if (path !== "/areas/") crumbs.push([crumbLabel, path]);
  } else {
    crumbs.push([crumbLabel, path]);
  }
  return crumbs;
}

export function sectionNav(path) {
  if (path.startsWith("/services/") && path !== "/services/") return services;
  if (path.startsWith("/areas/") && path !== "/areas/") return [...districts, ...cities];
  return [];
}
