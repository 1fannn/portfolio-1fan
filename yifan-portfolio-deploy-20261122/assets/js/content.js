/* Shared portfolio content. Project screenshots are local assets. */
window.PORTFOLIO = {
  "profile": {
    "firstName": "ZHANG YIFAN.",
    "role": "IT student · Full Stack Development",
    "bio": "I’m an Information Technology student at Republic Polytechnic, specialising in Full Stack Development and interested in data analysis. I work with Python, SQL, databases and web development, and I’m looking for an IT internship where I can learn and contribute. Welcome to my creative space.",
    "photo": "assets/images/profile/myself.jpg",
    "photoAlt": "Portrait of Zhang Yifan",
    "photoCaption": ""
  },
  "experience": [
    {
      "date": "Nov 2024 — Present",
      "title": "Service Crew",
      "subtitle": "Nine Fresh, Koufu",
      "description": "Contributed to a new store sales record while processing transactions accurately and maintaining service and hygiene standards. Built positive customer relationships and coordinated with teammates during busy periods."
    },
    {
      "date": "Apr 2024 — Jun 2024",
      "title": "Cashier",
      "subtitle": "Scarlett · Bedok Central",
      "description": "Handled daily transactions accurately and communicated professionally with customers in a fast-paced retail environment."
    },
    {
      "date": "Nov 2023 — Dec 2023",
      "title": "Operations Assistant",
      "subtitle": "Pan Malayan Pharmaceuticals",
      "description": "Picked, sorted and packed medical supplies accurately for time-sensitive orders. Volunteered for weekend overtime during large orders to help the team manage increased workloads."
    }
  ],
  "education": [
    {
      "date": "2025 — 2028",
      "title": "Diploma in Information Technology",
      "subtitle": "Republic Polytechnic",
      "description": "Major in Full Stack Development."
    }
  ],
  "projects": [
    {
      "id": "telcoassist-ai",
      "category": "automation",
      "categoryLabel": "AI / automation",
      "title": "TelcoAssist AI",
      "summary": "A hackathon team prototype for AI-assisted telco troubleshooting, roaming guidance and support escalation.",
      "coverText": "TelcoAssist AI",
      "coverColor": "#d6dfdf",
      "image": "assets/images/projects/telcoassist-ai.png",
      "imageAlt": "TelcoAssist AI live demo homepage with guided diagnosis and simulated telco support scenarios.",
      "details": "As part of a hackathon team, I worked on an AI customer support website for telco users. Our prototype brings troubleshooting and roaming guidance into one support experience across different providers.",
      "highlights": [
        "Created a team prototype with an AI support assistant and guided troubleshooting for common mobile and broadband issues.",
        "Included roaming and travel support alongside an agent console for reviewing escalated cases.",
        "Demonstrated support scenarios with fictional customers and simulated network data; no live telco APIs are connected."
      ],
      "stack": "Base44 · AI prototyping · Guided troubleshooting",
      "github": "",
      "live": "https://telco-flow-ai.base44.app",
      "role": "Hackathon Team Member",
      "year": ""
    },
    {
      "id": "gamenight",
      "category": "development",
      "categoryLabel": "Web apps",
      "title": "GameNight",
      "summary": "A community board game library with live availability, borrowing records and member reviews.",
      "coverText": "GameNight",
      "coverColor": "#eee4d6",
      "image": "assets/images/projects/gamenight.jpeg",
      "imageAlt": "GameNight game details screen showing Catan, availability and borrowing actions, from the project presentation.",
      "details": "As a team member, I built the game catalogue and detail pages for a community board game borrowing platform.",
      "highlights": [
        "Built a catalogue for users to browse board games and check their availability.",
        "Created individual game detail pages using the dynamic Express route GET /games/:id.",
        "Retrieved the selected game from MySQL using req.params.id and displayed its details with EJS templates."
      ],
      "stack": "Node.js · Express.js · EJS · MySQL (Azure) · Render",
      "github": "",
      "live": "https://c237-team1.onrender.com/",
      "role": "Team Member",
      "year": ""
    },
    {
      "id": "module-go",
      "category": "development",
      "categoryLabel": "Web apps",
      "title": "Module Go",
      "summary": "A module discovery platform for Republic Polytechnic students, with search, comparison, reviews and bookmarks.",
      "coverText": "Module Go",
      "coverColor": "#e6d5d8",
      "image": "assets/images/projects/module-go.png",
      "imageAlt": "Module Go module search header, captured from the local project preview.",
      "details": "As a team member in 2026, I helped develop features that make it easier for Republic Polytechnic students to discover and compare modules.",
      "highlights": [
        "Helped develop search, comparison, ratings, reviews and bookmark features.",
        "Built a GitHub Actions CI workflow for automated builds, tests, Ruff quality checks and Trivy security scans.",
        "Contributed to pytest validation."
      ],
      "stack": "GitHub Actions · pytest · Ruff · Trivy",
      "github": "https://github.com/xavlkh/ModuleGo",
      "live": "",
      "role": "Team Member",
      "year": "2026"
    },
    {
      "id": "sidehustle-launchpad",
      "category": "automation",
      "categoryLabel": "AI / automation",
      "title": "SideHustle Launchpad",
      "summary": "An AI-powered business-planning website for tertiary students, built through a coordinated team effort.",
      "coverText": "SideHustle",
      "coverColor": "#d6dfdf",
      "image": "assets/images/projects/sidehustle-launchpad.png",
      "imageAlt": "SideHustle Launchpad live website home screen.",
      "details": "As team captain in 2026, I coordinated our work on a business-planning website for tertiary students.",
      "highlights": [
        "Integrated a Botpress chatbot and multimedia content into the website.",
        "Tested navigation and key functions across team devices.",
        "Managed team roles and coordinated shared files and application testing."
      ],
      "stack": "Botpress · AI tools · Multimedia integration · Application testing",
      "github": "",
      "live": "https://1fannn.github.io/SideHustle-Launchpad/",
      "role": "Team Captain",
      "year": "2026"
    },
    {
      "id": "meal-manager",
      "category": "development",
      "categoryLabel": "Web apps",
      "title": "Meal Manager",
      "summary": "A responsive food journal with personal meal records, ratings, favourites and location sharing.",
      "coverText": "Meal Manager",
      "coverColor": "#dedacb",
      "image": "assets/images/projects/meal-manager.png",
      "imageAlt": "Meal Manager live website home screen.",
      "details": "As the developer in 2026, I built and deployed a responsive food journal with account-specific data.",
      "highlights": [
        "Built meal records, ratings, favourites, address search and location sharing.",
        "Implemented user authentication and account-specific data storage with PostgreSQL.",
        "Deployed the application on Render."
      ],
      "stack": "Node.js · Express.js · EJS · PostgreSQL · Render",
      "github": "",
      "live": "https://meal-manager-k8a2.onrender.com/",
      "role": "Developer",
      "year": "2026"
    }
  ],
  "skills": [
    {
      "name": "Python",
      "icon": "python"
    },
    {
      "name": "JavaScript",
      "icon": "javascript"
    },
    {
      "name": "HTML",
      "icon": "html5"
    },
    {
      "name": "CSS",
      "icon": "css"
    },
    {
      "name": "Node.js",
      "icon": "nodedotjs"
    },
    {
      "name": "Express.js",
      "icon": "express"
    },
    {
      "name": "Flask",
      "icon": "flask"
    },
    {
      "name": "EJS",
      "icon": "ejs"
    },
    {
      "name": "SQL",
      "icon": "sql"
    },
    {
      "name": "MySQL",
      "icon": "mysql"
    },
    {
      "name": "PostgreSQL",
      "icon": "postgresql"
    },
    {
      "name": "SQLite",
      "icon": "sqlite"
    },
    {
      "name": "GitHub",
      "icon": "github"
    },
    {
      "name": "GitHub Actions",
      "icon": "githubactions"
    },
    {
      "name": "Botpress",
      "icon": "botpress"
    },
    {
      "name": "n8n",
      "icon": "n8n"
    },
    {
      "name": "AI tools",
      "icon": "ai-tools"
    },
    {
      "name": "pytest",
      "icon": "pytest"
    },
    {
      "name": "Ruff",
      "icon": "ruff"
    },
    {
      "name": "Trivy",
      "icon": "trivy"
    }
  ],
  "strengths": [
    "Team collaboration",
    "Communication",
    "Adaptability",
    "Customer service",
    "Attention to detail"
  ]
};
