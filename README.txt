SPOTIFY VS - Configuration Backup
=================================
Date: 2026-02-14

This folder contains sensitive configuration files for your Spotify VS project.

FILES:
------
.env.local - Contains all API keys, secrets, and database credentials

SETUP ON NEW COMPUTER:
---------------------
1. Clone the repository from GitHub:
   git clone <your-repo-url>

2. Copy .env.local from this flashdrive folder to the project root:
   cp .env.local /path/to/spotifyvs/

3. Install dependencies:
   npm install

4. Run the development server:
   npm run dev

IMPORTANT:
----------
- Never commit .env.local to GitHub
- Keep this flashdrive in a secure location
- Update these backup files if you change any credentials
