// Sample game data - exported as ES module
export const GAME_SCENARIOS = [
    {
        id: 1,
        scenario: "You're trying to log into an app but forgot your password. The app asks you security questions to verify your identity.",
        question: "What is the app verifying?",
        correctAnswer: 2,
        options: [
            "Your phone number",
            "Your internet speed",
            "Your identity",
            "Your payment method"
        ]
    },
    {
        id: 2,
        scenario: "Your friend shares a Google Drive link with you to edit a document. You can see and edit the file without downloading it.",
        question: "What technology allows this?",
        correctAnswer: 0,
        options: [
            "Cloud storage",
            "USB cable",
            "Email attachment",
            "Bluetooth"
        ]
    },
    {
        id: 3,
        scenario: "A website loads slowly. You check and find that the page has 50 large images that download one by one.",
        question: "What would speed up the loading?",
        correctAnswer: 1,
        options: [
            "Adding more images",
            "Making images smaller or loading them in parallel",
            "Increasing the website size",
            "Adding more text"
        ]
    },
    {
        id: 4,
        scenario: "You're building a simple to-do list app. Each item has a name and a completion status (done/not done).",
        question: "What is this structure called?",
        correctAnswer: 2,
        options: [
            "Algorithm",
            "Database",
            "Data structure",
            "Loop"
        ]
    },
    {
        id: 5,
        scenario: "Your app crashes when 1000 users try to access it at the same time, but works fine with 100 users.",
        question: "What is the issue?",
        correctAnswer: 3,
        options: [
            "The app is broken",
            "Users are slow",
            "The server is too fast",
            "The server cannot handle the load"
        ]
    },
    {
        id: 6,
        scenario: "A password is 'password123'. An attacker tries to guess it by trying common passwords like 'password', 'qwerty', '123456'.",
        question: "What attack is this?",
        correctAnswer: 1,
        options: [
            "Hacking",
            "Brute force attack",
            "Malware",
            "Phishing"
        ]
    },
    {
        id: 7,
        scenario: "You write a function that takes 2 numbers and returns their sum. You test it with 10 test cases and it passes all.",
        question: "What is this testing called?",
        correctAnswer: 0,
        options: [
            "Unit testing",
            "System testing",
            "Integration testing",
            "Manual testing"
        ]
    },
    {
        id: 8,
        scenario: "A company's website is down for 2 hours. During this time, no one can access it. The company loses customers.",
        question: "What does the company need?",
        correctAnswer: 2,
        options: [
            "More developers",
            "Bigger budget",
            "Better uptime/reliability",
            "Faster internet"
        ]
    },
    {
        id: 9,
        scenario: "You're using a mobile app that stores your login session so you don't have to log in every time you open it.",
        question: "What is being used?",
        correctAnswer: 3,
        options: [
            "Cache memory",
            "RAM",
            "Cloud storage",
            "Session/token storage"
        ]
    },
    {
        id: 10,
        scenario: "A social media feed shows a mix of posts, stories, and ads. The order changes based on your activity and interactions.",
        question: "What technology personalizes this?",
        correctAnswer: 1,
        options: [
            "Database",
            "Algorithm",
            "API",
            "Server"
        ]
    },
    {
        id: 11,
        scenario: "Your school uses a system to send emails to all 500 students at once instead of typing each email individually.",
        question: "What is being used?",
        correctAnswer: 0,
        options: [
            "Batch processing",
            "Parallel processing",
            "Loop iteration",
            "API call"
        ]
    },
    {
        id: 12,
        scenario: "A mobile app asks for permission to access your camera, location, and contacts before you can use it.",
        question: "What is this called?",
        correctAnswer: 2,
        options: [
            "Encryption",
            "Authentication",
            "Authorization/Permissions",
            "Verification"
        ]
    },
    {
        id: 13,
        scenario: "You click a 'Sign in with Google' button instead of creating a new account on a website.",
        question: "What is this feature?",
        correctAnswer: 1,
        options: [
            "Two-factor authentication",
            "Single sign-on (SSO)",
            "Session management",
            "Password reset"
        ]
    },
    {
        id: 14,
        scenario: "A video streaming app buffers (loads in advance) while you watch. It downloads the next 30 seconds of video ahead of time.",
        question: "Why does it do this?",
        correctAnswer: 3,
        options: [
            "To waste data",
            "To make the app slower",
            "To store the entire video",
            "To prevent interruptions during playback"
        ]
    },
    {
        id: 15,
        scenario: "You receive an email claiming to be from your bank asking you to click a link and verify your account details.",
        question: "What type of attack is this?",
        correctAnswer: 0,
        options: [
            "Phishing",
            "Ransomware",
            "Virus",
            "DDoS attack"
        ]
    },
    {
        id: 16,
        scenario: "A file is locked and only certain people can open it. Others see 'Access Denied'.",
        question: "What controls this?",
        correctAnswer: 2,
        options: [
            "Firewall",
            "Antivirus",
            "Access control/Permissions",
            "Proxy"
        ]
    },
    {
        id: 17,
        scenario: "Your internet is slow. You restart your router and the speed improves. This is a common troubleshooting step.",
        question: "What might restarting fix?",
        correctAnswer: 1,
        options: [
            "Hardware damage",
            "Temporary bugs and memory issues",
            "Broken internet cables",
            "ISP problems"
        ]
    },
    {
        id: 18,
        scenario: "A payment website encrypts your credit card details before sending them to the server so hackers cannot read them.",
        question: "What security measure is this?",
        correctAnswer: 0,
        options: [
            "Encryption",
            "Hashing",
            "Authentication",
            "Tokenization"
        ]
    },
    {
        id: 19,
        scenario: "An app requests different levels of access depending on what you're doing - basic access for viewing, higher access for editing.",
        question: "What principle is this?",
        correctAnswer: 3,
        options: [
            "Zero trust",
            "Defense in depth",
            "Least privilege escalation",
            "Principle of least privilege"
        ]
    },
    {
        id: 20,
        scenario: "A website shows loading times: 5 seconds with no cache, 0.5 seconds with cache. Cache stores recently accessed data.",
        question: "Why is caching beneficial?",
        correctAnswer: 2,
        options: [
            "To make servers crash",
            "To increase storage",
            "To speed up data retrieval",
            "To decrease memory"
        ]
    },
    {
        id: 21,
        scenario: "You're buying something online. The website has SSL (green lock icon) before you enter payment details.",
        question: "What does SSL do?",
        correctAnswer: 1,
        options: [
            "Checks your payment",
            "Encrypts your connection",
            "Verifies the seller",
            "Increases speed"
        ]
    },
    {
        id: 22,
        scenario: "An app crashes and shows an error message with a code. The developer uses this code to find and fix the bug.",
        question: "What is this process?",
        correctAnswer: 3,
        options: [
            "Coding",
            "Testing",
            "Deployment",
            "Debugging"
        ]
    },
    {
        id: 23,
        scenario: "A service API allows 100 requests per minute per user. Your app tries to make 200 requests in a minute.",
        question: "What happens?",
        correctAnswer: 0,
        options: [
            "Extra requests are rejected (rate limited)",
            "All requests are accepted",
            "The server crashes",
            "Requests are delayed by 1 hour"
        ]
    },
    {
        id: 24,
        scenario: "You use the same password for email, social media, and banking. One site gets hacked.",
        question: "What is the consequence?",
        correctAnswer: 2,
        options: [
            "Only that site is affected",
            "Your phone gets hacked",
            "All your accounts are at risk",
            "Nothing happens"
        ]
    },
    {
        id: 25,
        scenario: "A developer writes code that checks if a number is negative before processing it. This prevents errors.",
        question: "What is this called?",
        correctAnswer: 1,
        options: [
            "Compilation",
            "Validation",
            "Execution",
            "Interpretation"
        ]
    },
    {
        id: 26,
        scenario: "A company backs up all its data to a separate location every day to protect against data loss.",
        question: "What is this practice called?",
        correctAnswer: 0,
        options: [
            "Backup and disaster recovery",
            "Data migration",
            "Data compression",
            "Data encryption"
        ]
    },
    {
        id: 27,
        scenario: "A mobile app shows a spinning wheel while data loads from the server. This tells the user the app is working.",
        question: "What is this element?",
        correctAnswer: 2,
        options: [
            "Button",
            "Form",
            "Loading indicator",
            "Navigation bar"
        ]
    },
    {
        id: 28,
        scenario: "A website uses a to-do list feature. Each task can have subtasks, and subtasks can have sub-subtasks.",
        question: "What structure is this?",
        correctAnswer: 3,
        options: [
            "Linear list",
            "Hash table",
            "Graph",
            "Tree or nested structure"
        ]
    },
    {
        id: 29,
        scenario: "Your app opens a PDF file that doesn't exist. It crashes because the file path is invalid.",
        question: "What should the app do?",
        correctAnswer: 1,
        options: [
            "Ignore the error",
            "Check if file exists before opening it (error handling)",
            "Delete the file",
            "Restart the app"
        ]
    },
    {
        id: 30,
        scenario: "A student writes a project report and saves it as PDF. They share the PDF with others who can view but not edit it.",
        question: "What advantage does PDF have?",
        correctAnswer: 0,
        options: [
            "Read-only format preserves original formatting",
            "PDF loads faster than Word",
            "PDF takes less space",
            "PDF allows editing on all devices"
        ]
    }
];

export default GAME_SCENARIOS;
