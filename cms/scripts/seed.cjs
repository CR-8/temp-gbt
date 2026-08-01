// One-time content migration: pushes the real Grobots content (previously
// hardcoded JSON in the old Vite site) into Strapi so the CMS starts
// populated instead of empty. Safe to re-run — it skips any content type
// that already has entries.
const { createStrapi } = require("@strapi/strapi");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function uploadLocalFile(strapi, filePath, alt) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const file = {
    filepath: filePath,
    originalFilename: path.basename(filePath),
    mimetype: MIME_BY_EXT[ext] || "application/octet-stream",
    size: stats.size,
  };
  const [uploaded] = await strapi.plugin("upload").service("upload").upload({
    data: { fileInfo: { alternativeText: alt || "" } },
    files: file,
  });
  return uploaded;
}

async function uploadRemoteImage(strapi, url, filename, alt) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "grobots-seed-"));
  const tmpPath = path.join(tmpDir, filename);
  await fsp.writeFile(tmpPath, buf);
  try {
    return await uploadLocalFile(strapi, tmpPath, alt);
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  }
}

async function publish(strapi, uid, documentId) {
  await strapi.documents(uid).publish({ documentId });
}

// ---------------------------------------------------------------------------
// Content

const SITE_SETTINGS = {
  brandName: "Grobots",
  brandTagline: "Where gears flex more than muscles.",
  heroTitle: "Grobots",
  heroUnicornProjectId: "gK3lOic9aLAOUfbUjBXK",
  heroUnicornSdkUrl: "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.6/dist/unicornStudio.umd.js",
  heroFooterItems: ["Build.", "Break.", "Repeat."],
  navbarLinks: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#projects" },
    { label: "Achievements", href: "/#achievements" },
    { label: "Team", href: "/team" },
  ],
  footerPhone: "+91 98765 43210",
  footerEmail: "grobotsclub@gmail.com",
  footerLinks: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#projects" },
    { label: "Achievements", href: "/#achievements" },
    { label: "Team", href: "/team" },
  ],
  footerSocial: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
  footerLegal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  teamPreviewLabel: "Meet The Team",
  teamPreviewFeaturedBatch: "2026",
  teamPreviewCtaLabel: "View All →",
  teamPreviewCtaHref: "/team",
  achievementsLabel: "Achievements",
};

const ABOUT = {
  introHeading:
    "We are the ones who stay in the lab when everyone else goes home — soldering, coding, and arguing about torque at 2 AM.",
  introSubheading: "Grobots",
  outroHeading: "The arena is waiting. Are you?",
  outroCtaLabel: "See our projects",
  outroCtaHref: "/#projects",
  galleryHeadings: [
    "Where adrenaline never stops and motors never sleep.",
    "Built by students. Feared by opponents.",
    "Every scar on the chassis is a lesson learned.",
    "The arena is our classroom. Victory is our grade.",
  ],
  galleryImages: [
    { src: "https://picsum.photos/seed/grobot1/400/500", alt: "Robot in the arena" },
    { src: "https://picsum.photos/seed/grobot2/400/500", alt: "Sensor array detail" },
    { src: "https://picsum.photos/seed/grobot3/400/500", alt: "Drive mechanism" },
    { src: "https://picsum.photos/seed/grobot4/400/500", alt: "Pre-match prep" },
    { src: "https://picsum.photos/seed/grobot5/400/500", alt: "Terrain test run" },
    { src: "https://picsum.photos/seed/grobot6/400/500", alt: "Close-up chassis" },
    { src: "https://picsum.photos/seed/grobot7/400/500", alt: "Combat bot ready" },
    { src: "https://picsum.photos/seed/grobot8/400/500", alt: "Night build session" },
    { src: "https://picsum.photos/seed/grobot9/400/500", alt: "Wheel assembly" },
    { src: "https://picsum.photos/seed/grobot10/400/500", alt: "Electronics bay" },
    { src: "https://picsum.photos/seed/grobot11/400/500", alt: "Drone frame build" },
    { src: "https://picsum.photos/seed/grobot12/400/500", alt: "Fleet lineup" },
    { src: "https://picsum.photos/seed/grobot13/400/500", alt: "Soil scanner test" },
    { src: "https://picsum.photos/seed/grobot14/400/500", alt: "Arm calibration" },
    { src: "https://picsum.photos/seed/grobot15/400/500", alt: "Post-match debrief" },
    { src: "https://picsum.photos/seed/grobot16/400/500", alt: "Team at competition" },
  ],
};

const PROJECTS = [
  {
    tag: "Combat Robotics",
    title: "Kaal",
    description:
      "Our 30KG combat beast. Titanium-reinforced wedge, brushless drive, and a weapon system that has ended matches in under 10 seconds. Kaal doesn't fight — it terminates.",
    longDescription:
      "Kaal started as a sketch on a whiteboard after we lost a close match at Cognizance '24 to a bot with better weapon torque. Two semesters later it's a 30KG titanium-wedge combat robot with a brushless spinner weapon capable of ending matches in under 10 seconds. Every panel is CNC-cut, every weld tested past the rulebook's safety margin, and every match logged so the next iteration fixes exactly what broke.",
    image: "https://picsum.photos/seed/proj1/800/600",
    color: "#1a1a2e",
    sortOrder: 0,
    year: 2025,
    githubUrl: "#",
    demoUrl: "#",
    highlights: [
      { icon: "scales", title: "30KG", description: "Weight class" },
      { icon: "lightning", title: "Brushless", description: "Drive system" },
      { icon: "shield", title: "Titanium", description: "Wedge armor" },
    ],
  },
  {
    tag: "Autonomous Racing",
    title: "Vega",
    description:
      "Zero to full throttle in 0.4 seconds. Vega is our line-following and autonomous racing platform — PID-tuned to perfection, built to lap the competition before they blink.",
    longDescription:
      "Vega is our autonomous line-following and racing platform, built around a tuned PID control loop reading a 16-sensor IR array at 1kHz. The chassis is 3D-printed for weight, the drivetrain is geared for straight-line speed over cornering torque, and the whole thing goes from a standstill to full throttle in 0.4 seconds. It's been rebuilt four times — every version faster and twitchier than the last.",
    image: "https://picsum.photos/seed/proj2/800/600",
    color: "#16213e",
    sortOrder: 1,
    year: 2024,
    githubUrl: "#",
    demoUrl: "#",
    highlights: [
      { icon: "gauge", title: "0.4s", description: "0 to full throttle" },
      { icon: "cpu", title: "PID-tuned", description: "16-sensor IR array" },
      { icon: "flag", title: "1st place", description: "AKTU Zonals" },
    ],
  },
  {
    tag: "Aerial Systems",
    title: "Talon",
    description:
      "A racing drone that hits 80 km/h on a straight. Talon was built for speed, tuned for precision, and has taken first place in drone racing events across three states.",
    longDescription:
      "Talon is our FPV racing drone platform — a 5-inch carbon fiber frame carrying a 4S battery setup tuned for top-end speed over endurance. On a straight it clears 80 km/h, and the flight controller is tuned aggressively enough that it rewards precise piloting over forgiving stability. It's taken first place in drone racing events across three states and remains our most-crashed, most-rebuilt airframe.",
    image: "https://picsum.photos/seed/proj3/800/600",
    color: "#0f3460",
    sortOrder: 2,
    year: 2024,
    githubUrl: "#",
    demoUrl: "#",
    highlights: [
      { icon: "wind", title: "80 km/h", description: "Top speed" },
      { icon: "battery-charging", title: "4S", description: "Battery config" },
      { icon: "trophy", title: "3 states", description: "First place finishes" },
    ],
  },
  {
    tag: "Robo Soccer",
    title: "Striker",
    description:
      "Fast, low, and impossible to stop. Striker is our robo-soccer platform — omnidirectional drive, real-time vision, and a shot that has scored in arenas from Lucknow to Kanpur.",
    longDescription:
      "Striker is our robo-soccer platform, built low and wide for stability at speed. Omnidirectional mecanum drive lets it change direction without losing momentum, a downward-facing camera handles real-time ball tracking, and a solenoid-actuated kicker gives it a shot that's scored in arenas from Lucknow to Kanpur. It's the bot we trust most in a tight match.",
    image: "https://picsum.photos/seed/proj4/800/600",
    color: "#533483",
    sortOrder: 3,
    year: 2024,
    githubUrl: "#",
    demoUrl: "#",
    highlights: [
      { icon: "arrows-out-cardinal", title: "Omnidirectional", description: "Mecanum drive" },
      { icon: "eye", title: "Real-time", description: "Vision tracking" },
      { icon: "soccer-ball", title: "Multi-city", description: "Tournament wins" },
    ],
  },
  {
    tag: "Innovation",
    title: "NovaMind",
    description:
      "Our open-innovation flagship. NovaMind is an AI-assisted robotic arm that won InnoQuest at AKTU Zonals — designed to solve real-world problems, not just win trophies.",
    longDescription:
      "NovaMind is our open-innovation flagship — a 5-DOF robotic arm paired with a lightweight vision model that identifies and sorts objects without hardcoded coordinates. It won InnoQuest at AKTU Zonals for tackling a real sorting-and-assembly problem rather than optimizing for a scoreboard. It's the project that convinced us to keep an open-innovation entry every season, not just combat and racing bots.",
    image: "https://picsum.photos/seed/proj5/800/600",
    color: "#2b2d42",
    sortOrder: 4,
    year: 2024,
    githubUrl: "#",
    demoUrl: "#",
    highlights: [
      { icon: "robot", title: "5-DOF", description: "Robotic arm" },
      { icon: "brain", title: "AI-assisted", description: "Vision-guided sorting" },
      { icon: "medal", title: "InnoQuest", description: "AKTU Zonals winner" },
    ],
  },
];

const ACHIEVEMENTS = [
  { name: "Cognizance '25", location: "IIT Roorkee", year: 2025, results: [{ event: "Robo War", category: "15KG", position: 1 }, { event: "Robo War", category: "30KG", position: 2 }], image: "achievements/cognizance25/1.jpg" },
  { name: "Celesta '24", location: "IIT Patna", year: 2024, results: [{ event: "Robo War", category: "15KG", position: 1 }], image: "achievements/celesta24/1.jpg" },
  { name: "Infotsav '24", location: "IIIT Gwalior", year: 2024, results: [{ event: "Robo War", category: "30KG", position: 1 }, { event: "Robo Race", category: null, position: 2 }, { event: "Drone Race", category: null, position: 1 }], image: "achievements/gantavya24.jpg" },
  { name: "SRMU", location: "SRMU", year: 2025, results: [{ event: "Robo Soccer", category: null, position: 1 }, { event: "Robo Sumo", category: null, position: 1 }], image: "achievements/srmu.jpg" },
  { name: "Utkarsh '25", location: "BBD", year: 2025, results: [{ event: "Robo Soccer", category: null, position: 2 }, { event: "Robo War", category: null, position: 1 }, { event: "Robo War", category: null, position: 3 }], image: "achievements/utkarsh25/1.jpg" },
  { name: "Prometheo", location: "IIT Jodhpur", year: 2024, results: [{ event: "Robo War", category: "60KG", position: 3 }], image: "achievements/jodhpur.jpg" },
  { name: "AKTU Zonals", location: "AKTU, Uttar Pradesh", year: 2024, results: [{ event: "Robo Race", category: null, position: 1 }, { event: "Robo War", category: null, position: 1 }, { event: "Robo Sumo", category: null, position: 1 }, { event: "Drone Tech", category: null, position: 1 }, { event: "Open Innovation", category: "InnoQuest", position: 1 }], image: "achievements/AktuZonal2024/1.jpg" },
  { name: "AKTU States", location: "AKTU, Uttar Pradesh", year: 2024, results: [{ event: "Overall University", category: null, position: 1 }, { event: "Robo Race", category: null, position: 1 }, { event: "Robo War", category: null, position: 1 }, { event: "Debate", category: null, position: 2 }], image: "achievements/AktuStates.jpg" },
  { name: "Amiphoria", location: "Amity University, Lucknow", year: 2024, results: [{ event: "Robo War", category: null, position: 1 }, { event: "Robo War", category: null, position: 2 }], image: "achievements/amity.jpg" },
  { name: "SRMS Bareilly", location: "SRMS, Bareilly", year: 2024, results: [{ event: "Robo War", category: null, position: 1 }, { event: "Robo Soccer", category: null, position: 1 }, { event: "Robo War", category: null, position: 2 }, { event: "Robo Soccer", category: null, position: 2 }, { event: "Robo Race", category: null, position: 2 }, { event: "Pick & Place", category: null, position: 2 }, { event: "Line Follower", category: null, position: 2 }], image: "achievements/srms.jpg" },
  { name: "BML Munjal", location: "BML Munjal, Haryana", year: 2024, results: [{ event: "Robo Soccer", category: null, position: 1 }], image: "achievements/bml.jpg" },
  { name: "BotFiesta", location: "MUIT, Lucknow", year: 2024, results: [{ event: "Robo Soccer", category: null, position: 2 }], image: "achievements/muit.jpg" },
  { name: "IITM Gwalior", location: "IITM Gwalior", year: 2024, results: [{ event: "Robo War", category: null, position: 1 }, { event: "Robo War", category: "Mini", position: 2 }, { event: "Drone Race", category: null, position: 1 }, { event: "Robo Race", category: null, position: 1 }], image: "achievements/iitmgwalior.jpg" },
  { name: "RGIPT Amethi", location: "RGIPT, Amethi", year: 2024, results: [{ event: "Robo Soccer", category: null, position: 1 }, { event: "Robo Soccer", category: null, position: 2 }], image: "achievements/rgipt.jpg" },
  { name: "TechKirti", location: "IIT Kanpur", year: 2024, results: [{ event: "Robo Soccer", category: null, position: 1 }], image: "achievements/iitk.jpg" },
  { name: "NIT Hamirpur", location: "NIT Hamirpur", year: 2024, results: [{ event: "Robo Soccer", category: null, position: 1 }], image: "achievements/nithamirpur.jpg" },
];

const TEAM_MEMBERS = [
  { name: "Satyarth Singh", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/satyarth.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Shashwat Maurya", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/shashwat1.jpg", linkedin: "https://www.linkedin.com/in/maurya-shashwat-134t152/", github: "#", instagram: "https://www.instagram.com/_shashwatm_" },
  { name: "Gyanendra Verma", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/gyanendra.jpg", linkedin: "https://www.linkedin.com/in/gyanendra-verma-480554254/", github: "#", instagram: "https://www.instagram.com/gyan_verma_7080" },
  { name: "Harsh Saxena", role: "Club Lead", department: "Club Lead", branch: "DS", batch: "2026", isAlumni: false, image: "/2026/harsh.jpg", linkedin: "https://www.linkedin.com/in/harshsaxena251103", github: "#", instagram: "https://www.instagram.com/harshsaxenarocks" },
  { name: "Prakriti Rai", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/prakriti.jpg", linkedin: "https://www.linkedin.com/in/prakriti-rai", github: "#", instagram: "https://www.instagram.com/i_mprakritiii" },
  { name: "Shashwat Singh Rathour", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/shashwat2.jpg", linkedin: "https://www.linkedin.com/in/shashwat-singh-a36666262", github: "#", instagram: "https://www.instagram.com/shashwat3643" },
  { name: "Saarthak Pandey", role: "Club Lead", department: "Club Lead", branch: "CSE", batch: "2026", isAlumni: false, image: "/2026/saarthak.jpg", linkedin: "#", github: "#", instagram: "https://www.instagram.com/__.saarthak.___" },
  { name: "Shivansh Pandey", role: "Coordinator", department: "Coordinator", branch: "EC", batch: "2027", isAlumni: false, image: "/2027/shivansh.jpeg", linkedin: "https://www.linkedin.com/in/shivansh-pandey-93260a2a3", github: "#", instagram: "https://www.instagram.com/nxs_shivansh" },
  { name: "Aarushi Khare", role: "Coordinator", department: "Coordinator", branch: "DS", batch: "2027", isAlumni: false, image: "/2027/aarushi.jpg", linkedin: "https://www.linkedin.com/in/aarushi-khare-87a284305/", github: "#", instagram: "https://www.instagram.com/_lunaamore" },
  { name: "Priyanshu Choudhary", role: "Coordinator", department: "Coordinator", branch: "EC", batch: "2027", isAlumni: false, image: "/2027/priyanshu-chaudhary.jpg", linkedin: "https://www.linkedin.com/in/priyanshu-choudhary-73aa742a9", github: "#", instagram: "https://www.instagram.com/priyaxnshu_choudhary" },
  { name: "Aman Sindhi", role: "Coordinator", department: "Coordinator", branch: "EC", batch: "2027", isAlumni: false, image: "/2027/aman.jpg", linkedin: "https://www.linkedin.com/in/aman-sindhi-a5a252349", github: "#", instagram: "https://www.instagram.com/amansindhi_07" },
  { name: "Vansh Goel", role: "Coordinator", department: "Coordinator", branch: "AL", batch: "2027", isAlumni: false, image: "/2027/vansh.jpg", linkedin: "https://www.linkedin.com/in/vansh-goel-700779277/", github: "#", instagram: "https://www.instagram.com/vannsh_goel" },
  { name: "Mayank Yadav", role: "Coordinator", department: "Coordinator", branch: "DS", batch: "2027", isAlumni: false, image: "/2027/mayank.jpg", linkedin: "https://www.linkedin.com/in/mayank-yadav-a85543306", github: "#", instagram: "https://www.instagram.com/mayank_y11" },
  { name: "Shatakchi Gupta", role: "Coordinator", department: "Coordinator", branch: "CSE", batch: "2027", isAlumni: false, image: "/2027/shatakchi.jpg", linkedin: "https://www.linkedin.com/in/shatakchi-gupta-4320b7295", github: "#", instagram: "https://www.instagram.com/uniqueness_2425" },
  { name: "Pratyush Tiwari", role: "Coordinator", department: "Coordinator", branch: "DS", batch: "2027", isAlumni: false, image: "/2027/pratyush.jpg", linkedin: "https://www.linkedin.com/in/pratyush-tiwari-cr8", github: "#", instagram: "#" },
  { name: "Rishi Mandal", role: "Coordinator", department: "Coordinator", branch: "IT", batch: "2027", isAlumni: false, image: "/2027/rishi.jpg", linkedin: "https://www.linkedin.com/in/rishi-mandal-2395b522b/", github: "#", instagram: "#" },
  { name: "Vaneesha Sinha", role: "Coordinator", department: "Coordinator", branch: "EC", batch: "2027", isAlumni: false, image: "/2027/vaneesha.jpeg", linkedin: "https://www.linkedin.com/in/vaneesha-sinha-673569280", github: "#", instagram: "https://www.instagram.com/vaneesha_01" },
  { name: "Priyanshu Pandey", role: "Coordinator", department: "Coordinator", branch: "DS", batch: "2027", isAlumni: false, image: "/2027/priyanshu.jpg", linkedin: "https://www.linkedin.com/in/priyanshu-pandey-a9b573292/", github: "#", instagram: "https://www.instagram.com/impriyan5hu" },
  { name: "Rudra Pratap Singh", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/rudra.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Ishan Mishra", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/Ishan.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Anuj Dubey", role: "Alumni", department: "Alumni", branch: "ECE", batch: "2025", isAlumni: true, image: "/2025/anuj.png", linkedin: "http://www.linkedin.com/in/dmanuj4", github: "http://www.github.com/dmanuj4", instagram: "http://www.instagram.com/dmanuj4_" },
  { name: "Himanshu", role: "Alumni", department: "Alumni", branch: "ECE", batch: "2025", isAlumni: true, image: "/2025/himanshu.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Akshat Srivastava", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/akshatsri.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Sanskar Sahai", role: "Alumni", department: "Alumni", branch: "ECE", batch: "2025", isAlumni: true, image: "/2025/sanskar.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Unnati Pandey", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/unnati-aiml.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Anshika Patel", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/anshika.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Harshit Srivastava", role: "Alumni", department: "Alumni", branch: "ECE", batch: "2025", isAlumni: true, image: "/2025/harshit.png", linkedin: "#", github: "#", instagram: "#" },
  { name: "Abhishek Kumar", role: "Alumni", department: "Alumni", branch: "AI & ML", batch: "2025", isAlumni: true, image: "/2025/abhishek.jpeg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Praharsh Singh", role: "Alumni", department: "Alumni", branch: "BCA", batch: "2025", isAlumni: true, image: "/2025/praharsh.jpg", linkedin: "https://www.linkedin.com/in/praharsh-singh-822a1224b", github: "https://github.com/Praharsh7270", instagram: "https://www.instagram.com/praharshsingh63/" },
  { name: "Aditya Tripathi", role: "Alumni", department: "Alumni", branch: "BCA", batch: "2025", isAlumni: true, image: "/2025/aditya.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Ankit", role: "Alumni", department: "Alumni", branch: "ECE", batch: "2025", isAlumni: true, image: "/2025/ankit.jpg", linkedin: "#", github: "#", instagram: "#" },
  { name: "Ankit", role: "Alumni", department: "Alumni", branch: "ME", batch: "2024", isAlumni: true, image: "/mentor/ankit.jpg", linkedin: "#", github: "#", instagram: "#" },
].map((m, i) => ({ ...m, sortOrder: i + 1, bio: "", email: "" }));

const CATEGORIES = [
  { name: "Build Logs", slug: "build-logs" },
  { name: "Competitions", slug: "competitions" },
  { name: "Behind the Scenes", slug: "behind-the-scenes" },
];

const TAGS = [
  { name: "Combat Robotics", slug: "combat-robotics" },
  { name: "Drones", slug: "drones" },
  { name: "AKTU", slug: "aktu" },
  { name: "Workshop", slug: "workshop" },
];

const AUTHORS = [
  {
    name: "Grobots Editorial",
    bio: "The club's collective byline for build logs, recaps, and announcements written by whoever was closest to the soldering iron.",
    avatar: "https://picsum.photos/seed/grobots-editorial/200/200",
  },
];

function paragraph(text) {
  return { type: "paragraph", children: [{ type: "text", text }] };
}
function heading(level, text) {
  return { type: "heading", level, children: [{ type: "text", text }] };
}

const ARTICLES = [
  {
    title: "Building Kaal: How We Designed Our First 30KG Combat Bot",
    slug: "building-kaal-30kg-combat-bot",
    excerpt:
      "A look inside the design decisions, failed prototypes, and 2 AM soldering sessions that turned Kaal from a whiteboard sketch into a 30KG titanium-wedge combat robot.",
    coverImage: "https://picsum.photos/seed/blog-kaal/1200/700",
    publishedDate: "2025-03-14",
    featured: true,
    categorySlug: "build-logs",
    tagSlugs: ["combat-robotics", "workshop"],
    body: [
      paragraph(
        "Kaal started as a sketch on a whiteboard after we lost a close match at Cognizance '24 to a bot with better weapon torque. Two semesters later it's a 30KG titanium-wedge combat robot with a brushless spinner weapon capable of ending matches in under 10 seconds."
      ),
      heading(2, "The wedge problem"),
      paragraph(
        "Our first prototype used a mild-steel wedge that deformed after two matches. We switched to titanium sheet, which cost more but held its shape through an entire tournament without needing rework between fights."
      ),
      heading(2, "Tuning the weapon"),
      paragraph(
        "Getting the brushless spinner balanced took three iterations. Too much mass at the tips and the bearings wore out mid-match; too little and it couldn't transfer enough energy on impact. We landed on a asymmetric blade profile that's still winning matches a year later."
      ),
    ],
  },
  {
    title: "What Winning AKTU Zonals Actually Looked Like",
    slug: "aktu-zonals-recap",
    excerpt:
      "Five events, one weekend, and a sweep across Robo Race, Robo War, Robo Sumo, Drone Tech, and Open Innovation. Here's how the weekend actually went.",
    coverImage: "https://picsum.photos/seed/blog-aktu/1200/700",
    publishedDate: "2024-11-02",
    featured: false,
    categorySlug: "competitions",
    tagSlugs: ["aktu", "drones"],
    body: [
      paragraph(
        "AKTU Zonals 2024 was the first time we entered every category the fest offered — Robo Race, Robo War, Robo Sumo, Drone Tech, and Open Innovation — and came away with first place in all five."
      ),
      heading(2, "The logistics nightmare"),
      paragraph(
        "Running five bots through five separate event schedules with a twelve-person team meant constant triage: whoever wasn't actively competing was on pit-crew duty for whichever bot needed repairs next."
      ),
      heading(2, "What we'd do differently"),
      paragraph(
        "NovaMind's InnoQuest win in Open Innovation was closer than the scoreboard suggested — we nearly ran out of demo time. Next year we're scripting the demo in advance instead of improvising it live."
      ),
    ],
  },
  {
    title: "Inside the Workshop: A Night Before Competition",
    slug: "night-before-competition",
    excerpt:
      "It's 1 AM, three bots aren't finished, and the van leaves at 6. A behind-the-scenes look at what the night before a competition actually looks like for Grobots.",
    coverImage: "https://picsum.photos/seed/blog-workshop/1200/700",
    publishedDate: "2025-01-20",
    featured: false,
    categorySlug: "behind-the-scenes",
    tagSlugs: ["workshop"],
    body: [
      paragraph(
        "There's a specific kind of chaos that sets in the night before a competition. Three bots aren't finished, the 3D printer jams at the worst possible time, and someone always discovers a cracked solder joint at midnight."
      ),
      heading(2, "The unofficial rules"),
      paragraph(
        "Rule one: nobody sleeps until every bot passes a full function test, not just a visual check. Rule two: whoever breaks something fixes it — no handing off half-finished repairs to the next shift."
      ),
      paragraph(
        "It's not a sustainable way to build robots, and we know it. But there's something about that last-night pressure that's produced some of our best last-minute fixes."
      ),
    ],
  },
];

// ---------------------------------------------------------------------------

async function seed() {
  const strapi = createStrapi({ appDir: process.cwd(), distDir: path.join(process.cwd(), "dist") });
  await strapi.load();

  try {
    await seedSiteSettings(strapi);
    await seedAbout(strapi);
    await seedProjects(strapi);
    await seedAchievements(strapi);
    await seedTeamMembers(strapi);
    await seedBlog(strapi);
    console.log("[seed] Done.");
  } finally {
    await strapi.destroy();
  }
}

async function seedSiteSettings(strapi) {
  const uid = "api::site-setting.site-setting";
  const existing = await strapi.documents(uid).findFirst();
  if (existing) {
    console.log("[seed] site-setting already exists, skipping");
    return;
  }
  const doc = await strapi.documents(uid).create({ data: SITE_SETTINGS });
  await publish(strapi, uid, doc.documentId);
  console.log("[seed] site-setting created");
}

async function seedAbout(strapi) {
  const uid = "api::about.about";
  const existing = await strapi.documents(uid).findFirst();
  if (existing) {
    console.log("[seed] about already exists, skipping");
    return;
  }

  console.log("[seed] uploading about gallery images...");
  const galleryImages = [];
  for (const img of ABOUT.galleryImages) {
    const filename = img.src.split("/").pop() + ".jpg";
    const uploaded = await uploadRemoteImage(strapi, img.src, filename, img.alt);
    galleryImages.push(uploaded.id);
  }

  const doc = await strapi.documents(uid).create({
    data: { ...ABOUT, galleryImages },
  });
  await publish(strapi, uid, doc.documentId);
  console.log("[seed] about created");
}

async function seedProjects(strapi) {
  const uid = "api::project.project";
  const count = await strapi.documents(uid).count();
  if (count > 0) {
    console.log("[seed] projects already exist, skipping");
    return;
  }

  for (const p of PROJECTS) {
    console.log(`[seed] uploading project image for ${p.title}...`);
    const image = await uploadRemoteImage(strapi, p.image, `${p.title}.jpg`, p.title);
    const gallerySeeds = [1, 2, 3].map((n) => `https://picsum.photos/seed/${p.title.toLowerCase()}-gallery${n}/900/700`);
    const gallery = [];
    for (const [i, url] of gallerySeeds.entries()) {
      const uploaded = await uploadRemoteImage(strapi, url, `${p.title}-gallery-${i + 1}.jpg`, `${p.title} detail ${i + 1}`);
      gallery.push(uploaded.id);
    }
    const doc = await strapi.documents(uid).create({
      data: { ...p, image: image.id, gallery },
    });
    await publish(strapi, uid, doc.documentId);
  }
  console.log(`[seed] ${PROJECTS.length} projects created`);
}

async function seedAchievements(strapi) {
  const uid = "api::achievement.achievement";
  const count = await strapi.documents(uid).count();
  if (count > 0) {
    console.log("[seed] achievements already exist, skipping");
    return;
  }

  for (const a of ACHIEVEMENTS) {
    const { image: imagePath, ...rest } = a;
    const absPath = path.join(PUBLIC_DIR, imagePath);
    let imageId;
    if (fs.existsSync(absPath)) {
      const uploaded = await uploadLocalFile(strapi, absPath, a.name);
      imageId = uploaded.id;
    } else {
      console.warn(`[seed] missing image for ${a.name}: ${absPath}`);
    }
    const doc = await strapi.documents(uid).create({ data: { ...rest, image: imageId } });
    await publish(strapi, uid, doc.documentId);
  }
  console.log(`[seed] ${ACHIEVEMENTS.length} achievements created`);
}

async function seedTeamMembers(strapi) {
  const uid = "api::team-member.team-member";
  const count = await strapi.documents(uid).count();
  if (count > 0) {
    console.log("[seed] team members already exist, skipping");
    return;
  }

  for (const m of TEAM_MEMBERS) {
    const { image: imagePath, ...rest } = m;
    const absPath = path.join(PUBLIC_DIR, imagePath);
    let photoId;
    if (fs.existsSync(absPath)) {
      const uploaded = await uploadLocalFile(strapi, absPath, m.name);
      photoId = uploaded.id;
    } else {
      console.warn(`[seed] missing photo for ${m.name}: ${absPath}`);
    }
    const doc = await strapi.documents(uid).create({
      data: { ...rest, photo: photoId },
    });
    await publish(strapi, uid, doc.documentId);
  }
  console.log(`[seed] ${TEAM_MEMBERS.length} team members created`);
}

async function seedBlog(strapi) {
  const articleUid = "api::article.article";
  const count = await strapi.documents(articleUid).count();
  if (count > 0) {
    console.log("[seed] articles already exist, skipping");
    return;
  }

  const categoryBySlug = {};
  for (const c of CATEGORIES) {
    const doc = await strapi.documents("api::category.category").create({ data: c });
    categoryBySlug[c.slug] = doc.documentId;
  }

  const tagBySlug = {};
  for (const t of TAGS) {
    const doc = await strapi.documents("api::tag.tag").create({ data: t });
    tagBySlug[t.slug] = doc.documentId;
  }

  let authorDocumentId;
  for (const a of AUTHORS) {
    console.log(`[seed] uploading avatar for ${a.name}...`);
    const avatar = await uploadRemoteImage(strapi, a.avatar, `${a.name}.jpg`, a.name);
    const doc = await strapi.documents("api::author.author").create({
      data: { name: a.name, bio: a.bio, avatar: avatar.id },
    });
    authorDocumentId = doc.documentId;
  }

  for (const article of ARTICLES) {
    const { categorySlug, tagSlugs, coverImage, ...rest } = article;
    console.log(`[seed] uploading cover image for "${article.title}"...`);
    const cover = await uploadRemoteImage(strapi, coverImage, `${article.slug}.jpg`, article.title);
    const doc = await strapi.documents(articleUid).create({
      data: {
        ...rest,
        coverImage: cover.id,
        category: categoryBySlug[categorySlug],
        tags: tagSlugs.map((s) => tagBySlug[s]),
        author: authorDocumentId,
      },
    });
    await publish(strapi, articleUid, doc.documentId);
  }
  console.log(`[seed] ${ARTICLES.length} articles created`);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
