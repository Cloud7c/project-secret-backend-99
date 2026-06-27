const fs = require('fs');
const content = `
## Enterprise Architecture & Scalability Rules
- The site will scale to be massive (like Amazon/OLX). Architecture must be highly manageable, modular, and efficient.
- Use enterprise-grade formulas and approaches to ensure blazing fast performance and zero data loss in the database.
- NO DUMMIES. Ensure all placeholders or mock data are strictly removed or replaced with robust loading states or actual dynamic database connections.
- Proceed step-by-step and test rigorously at every stage.
`;
fs.appendFileSync('.agents/AGENTS.md', content);
