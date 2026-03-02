// Sample game data - exported as ES module
export const GAME_SCENARIOS = [
    // === SECTION A: PC BUILDING ===
    {
        id: 1,
        scenario: "Rahul is building his first PC. The system powers on, but there is no display. Fans are spinning normally.",
        question: "What should he check first?",
        correctAnswer: 1,
        options: [
            "Install antivirus",
            "Monitor cable and GPU connection",
            "Change operating system",
            "Upgrade RAM"
        ]
    },
    {
        id: 2,
        scenario: "Priya installed a new SSD but her PC still boots slowly from the old hard drive.",
        question: "What is the most likely reason?",
        correctAnswer: 1,
        options: [
            "SSD is damaged",
            "BIOS boot order is wrong",
            "CPU is weak",
            "Internet is slow"
        ]
    },
    {
        id: 3,
        scenario: "During a workshop, a student installs RAM in random slots and the PC shows reduced performance.",
        question: "Why?",
        correctAnswer: 1,
        options: [
            "GPU issue",
            "Dual-channel not enabled",
            "SSD problem",
            "Power supply fault"
        ]
    },
    {
        id: 4,
        scenario: "An assembled PC shuts down during heavy gaming.",
        question: "What should be checked first?",
        correctAnswer: 1,
        options: [
            "Wallpaper settings",
            "Cooling and power supply",
            "Browser cache",
            "Keyboard drivers"
        ]
    },
    {
        id: 5,
        scenario: "A gamer upgrades only the CPU but still gets low FPS.",
        question: "What is likely the bottleneck?",
        correctAnswer: 1,
        options: [
            "Keyboard",
            "GPU",
            "Monitor stand",
            "WiFi"
        ]
    },
    {
        id: 6,
        scenario: "Arjun upgraded his GPU but forgot to upgrade the power supply. The system crashes under load.",
        question: "Why?",
        correctAnswer: 1,
        options: [
            "Driver color mismatch",
            "Insufficient PSU wattage",
            "SSD overheating",
            "RAM speed too high"
        ]
    },
    {
        id: 7,
        scenario: "Thermal paste is applied incorrectly and CPU temps spike.",
        question: "What is the likely result?",
        correctAnswer: 1,
        options: [
            "Better cooling",
            "CPU throttling",
            "More RAM speed",
            "Faster internet"
        ]
    },
    {
        id: 8,
        scenario: "A user mixes RAM sticks with different speeds.",
        question: "What usually happens?",
        correctAnswer: 1,
        options: [
            "PC becomes faster",
            "Runs at lower compatible speed",
            "GPU improves",
            "SSD slows permanently"
        ]
    },
    {
        id: 9,
        scenario: "A mini-ITX gaming build overheats despite good hardware.",
        question: "Most likely issue?",
        correctAnswer: 0,
        options: [
            "Poor airflow design",
            "Slow internet",
            "Old monitor",
            "Wrong wallpaper"
        ]
    },
    {
        id: 10,
        scenario: "After enabling XMP/EXPO, a PC becomes unstable.",
        question: "What is the best next step?",
        correctAnswer: 1,
        options: [
            "Remove GPU",
            "Reduce RAM frequency or update BIOS",
            "Change monitor",
            "Reinstall Windows"
        ]
    },
    {
        id: 11,
        scenario: "A workstation needs fast editing and storage performance.",
        question: "What is the best setup?",
        correctAnswer: 1,
        options: [
            "HDD only",
            "NVMe for OS + separate SSD for projects",
            "USB drive only",
            "Single slow disk"
        ]
    },
    {
        id: 12,
        scenario: "A builder installs GPU but forgets PCIe power cables.",
        question: "What happens?",
        correctAnswer: 1,
        options: [
            "GPU boosts performance",
            "No display or instability",
            "Faster boot",
            "Better cooling"
        ]
    },
    {
        id: 13,
        scenario: "PC powers on but no POST beep and no display.",
        question: "What is the first troubleshooting step?",
        correctAnswer: 1,
        options: [
            "Replace CPU immediately",
            "Reseat RAM and check power cables",
            "Format SSD",
            "Update Windows"
        ]
    },
    {
        id: 14,
        scenario: "A high-end GPU runs hot in a case with a solid front panel.",
        question: "What is the best fix?",
        correctAnswer: 1,
        options: [
            "Increase RGB",
            "Improve case airflow or change case",
            "Disable drivers",
            "Lower monitor refresh"
        ]
    },
    {
        id: 15,
        scenario: "A system randomly restarts during gaming after moving the PC.",
        question: "What should you check first?",
        correctAnswer: 1,
        options: [
            "Browser extensions",
            "Loose cables or partially seated GPU",
            "Wallpaper",
            "Mouse battery"
        ]
    },
    {
        id: 16,
        scenario: "A creator wants silent operation with good performance.",
        question: "What is the best approach?",
        correctAnswer: 1,
        options: [
            "Small stock cooler",
            "Larger air cooler and optimized fan curves",
            "Disable fans",
            "Overclock everything"
        ]
    },
    {
        id: 17,
        scenario: "BIOS does not recognize a new CPU.",
        question: "What is the likely fix?",
        correctAnswer: 1,
        options: [
            "Change SSD",
            "Update BIOS",
            "Add RGB",
            "Replace monitor"
        ]
    },
    {
        id: 18,
        scenario: "USB devices disconnect randomly after a new build.",
        question: "What is the possible cause?",
        correctAnswer: 1,
        options: [
            "Theme settings",
            "Front-panel header or power issue",
            "Browser cache",
            "Wi-Fi channel"
        ]
    },
    {
        id: 19,
        scenario: "A user wants future-proofing for 3–5 years.",
        question: "Where should they spend extra budget?",
        correctAnswer: 1,
        options: [
            "Case stickers",
            "PSU and motherboard platform",
            "Mouse pad",
            "RGB strips"
        ]
    },
    {
        id: 20,
        scenario: "GPU temps are fine but hotspot temp is very high.",
        question: "What can this indicate?",
        correctAnswer: 1,
        options: [
            "Normal always",
            "Poor contact or paste/pad issue",
            "Slow internet",
            "RAM issue"
        ]
    },
    {
        id: 21,
        scenario: "Slow file transfers between drives in a new build.",
        question: "What should you check first?",
        correctAnswer: 1,
        options: [
            "Wallpaper",
            "Drive type/slot and interface limits",
            "Keyboard layout",
            "Speaker volume"
        ]
    },
    {
        id: 22,
        scenario: "A PC only boots after reseating GPU multiple times.",
        question: "What is the likely issue?",
        correctAnswer: 1,
        options: [
            "CPU cooler",
            "PCIe seating or case alignment",
            "SSD firmware",
            "Browser plugins"
        ]
    },
    {
        id: 23,
        scenario: "A user asks whether to upgrade CPU or GPU first for gaming.",
        question: "What is the best deciding factor?",
        correctAnswer: 1,
        options: [
            "RGB sync",
            "Current usage bottleneck metrics",
            "Desk size",
            "OS theme"
        ]
    },
    {
        id: 24,
        scenario: "Cable management blocks airflow in a PC build.",
        question: "What is the best improvement?",
        correctAnswer: 1,
        options: [
            "Remove side panel",
            "Route cables behind motherboard tray",
            "Disable fans",
            "Lower resolution"
        ]
    },
    {
        id: 25,
        scenario: "A system boots but RAM shows lower speed than advertised.",
        question: "Why?",
        correctAnswer: 1,
        options: [
            "Broken RAM",
            "XMP/EXPO not enabled",
            "GPU issue",
            "Monitor cable"
        ]
    },
    // === SECTION B: LATEST & FAMOUS TECH TOPICS ===
    {
        id: 26,
        scenario: "A company wants to add generative AI features to its app.",
        question: "What should be evaluated first?",
        correctAnswer: 1,
        options: [
            "Logo color",
            "Cost, accuracy, and privacy risks",
            "Keyboard type",
            "Office chairs"
        ]
    },
    {
        id: 27,
        scenario: "An internal AI chatbot must avoid leaking company data.",
        question: "What is the best safeguard?",
        correctAnswer: 1,
        options: [
            "Public internet access",
            "Access controls and data filtering",
            "Bigger GPU",
            "Disable logs"
        ]
    },
    {
        id: 28,
        scenario: "Developers rely on AI coding assistants.",
        question: "What practice keeps code quality high?",
        correctAnswer: 1,
        options: [
            "Skip reviews",
            "Human code review and testing",
            "Auto-merge all PRs",
            "Disable CI"
        ]
    },
    {
        id: 29,
        scenario: "A startup considers microservices after scaling issues.",
        question: "What is a good signal to migrate?",
        correctAnswer: 1,
        options: [
            "Small team with simple app",
            "Independent scaling needs",
            "Fewer users",
            "No deployments"
        ]
    },
    {
        id: 30,
        scenario: "A cloud bill doubled after a release.",
        question: "What is the first investigation step?",
        correctAnswer: 1,
        options: [
            "Buy more servers",
            "Check resource usage and autoscaling",
            "Change logo",
            "Reset passwords"
        ]
    },
    {
        id: 31,
        scenario: "A bad CI/CD deployment breaks production.",
        question: "What should already exist to handle this?",
        correctAnswer: 1,
        options: [
            "Extra meetings",
            "Rollback strategy",
            "Bigger monitors",
            "New IDE"
        ]
    },
    {
        id: 32,
        scenario: "An app must handle millions of users during a live event.",
        question: "What is the key preparation?",
        correctAnswer: 1,
        options: [
            "Manual scaling",
            "Load testing and autoscaling",
            "Disable caching",
            "Single server"
        ]
    },
    {
        id: 33,
        scenario: "A team wants Kubernetes but lacks experience.",
        question: "What is the best approach?",
        correctAnswer: 1,
        options: [
            "Migrate everything at once",
            "Start with a small non-critical service",
            "Avoid monitoring",
            "Remove containers"
        ]
    },
    {
        id: 34,
        scenario: "A company adopts a lakehouse platform like Databricks.",
        question: "What is the main benefit?",
        correctAnswer: 1,
        options: [
            "Gaming support",
            "Unified data + analytics + ML",
            "Better wallpapers",
            "Faster keyboards"
        ]
    },
    {
        id: 35,
        scenario: "A company is hit by ransomware.",
        question: "What is the first technical action to take?",
        correctAnswer: 1,
        options: [
            "Ignore it",
            "Isolate affected systems",
            "Restart PCs",
            "Delete backups"
        ]
    },
    {
        id: 36,
        scenario: "You find an open cloud storage bucket exposing data.",
        question: "What should you do first?",
        correctAnswer: 1,
        options: [
            "Share the link",
            "Restrict access immediately",
            "Rename files",
            "Increase storage"
        ]
    },
    {
        id: 37,
        scenario: "An AI model shows biased outputs.",
        question: "What should you review?",
        correctAnswer: 1,
        options: [
            "Keyboard drivers",
            "Training data and evaluation metrics",
            "Monitor size",
            "CPU cooler"
        ]
    },
    {
        id: 38,
        scenario: "A mobile app slows down after adding analytics SDKs.",
        question: "What is the best step?",
        correctAnswer: 1,
        options: [
            "Add more SDKs",
            "Profile performance and remove heavy calls",
            "Change icons",
            "Reduce RAM"
        ]
    },
    {
        id: 39,
        scenario: "A product manager wants real-time dashboards.",
        question: "What is the suitable approach?",
        correctAnswer: 1,
        options: [
            "Batch-only jobs",
            "Streaming pipelines",
            "Manual exports",
            "Email reports only"
        ]
    },
    {
        id: 40,
        scenario: "A team is choosing whether to use serverless architecture.",
        question: "When is serverless a poor fit?",
        correctAnswer: 1,
        options: [
            "Event-driven APIs",
            "Long-running heavy workloads",
            "Small tasks",
            "Infrequent jobs"
        ]
    },
    {
        id: 41,
        scenario: "A team is deciding between SQL and NoSQL for a fast-changing product.",
        question: "What is the key criterion?",
        correctAnswer: 1,
        options: [
            "Team favorite",
            "Data access patterns and consistency needs",
            "Logo color",
            "Screen size"
        ]
    },
    {
        id: 42,
        scenario: "A security team adopts a zero-trust model.",
        question: "What does zero-trust security mean?",
        correctAnswer: 1,
        options: [
            "Trust the internal network",
            "Verify every request",
            "Share credentials freely",
            "Disable MFA"
        ]
    },
    {
        id: 43,
        scenario: "An ML model degrades in production due to data drift.",
        question: "What helps address this?",
        correctAnswer: 1,
        options: [
            "Ignore metrics",
            "Monitoring and retraining pipeline",
            "More UI tests",
            "Larger font"
        ]
    },
    {
        id: 44,
        scenario: "A team chooses edge computing for IoT devices.",
        question: "What is the main reason?",
        correctAnswer: 1,
        options: [
            "Increase cloud latency",
            "Reduce latency and bandwidth usage",
            "Remove devices",
            "Avoid updates"
        ]
    },
    {
        id: 45,
        scenario: "A company is training an AI model under strict privacy regulations.",
        question: "What is required?",
        correctAnswer: 1,
        options: [
            "Raw data sharing",
            "Data minimization and anonymization",
            "No logs",
            "Public datasets only"
        ]
    },
    {
        id: 46,
        scenario: "A social app sees bot activity spikes.",
        question: "What is the best response?",
        correctAnswer: 1,
        options: [
            "Disable the app",
            "Rate limiting and behavior detection",
            "Remove all users",
            "Change theme"
        ]
    },
    {
        id: 47,
        scenario: "A development team is considering WebAssembly for their web app.",
        question: "When is WebAssembly most useful?",
        correctAnswer: 1,
        options: [
            "Simple static pages",
            "Performance-critical browser tasks",
            "Writing CSS",
            "Sending emails"
        ]
    },
    {
        id: 48,
        scenario: "Global users face high latency in a fintech app.",
        question: "What is the best improvement?",
        correctAnswer: 1,
        options: [
            "Single region only",
            "CDN and multi-region deployment",
            "Bigger logo",
            "Disable caching"
        ]
    },
    {
        id: 49,
        scenario: "An API v2 release breaks existing integrations.",
        question: "What is the best practice to avoid this?",
        correctAnswer: 1,
        options: [
            "Instant removal of v1",
            "Versioning and migration period",
            "No documentation",
            "Silent changes"
        ]
    },
    {
        id: 50,
        scenario: "AI agents are introduced for automation in a company.",
        question: "What does a safe rollout require?",
        correctAnswer: 1,
        options: [
            "Full autonomy immediately",
            "Human-in-the-loop controls",
            "No monitoring",
            "Disable logs"
        ]
    }
];

export default GAME_SCENARIOS;