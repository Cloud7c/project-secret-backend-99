const fs = require('fs');
const content = `
## Strict Workflow Rules
- NEVER commit to git unless explicitly instructed to do so by the user. Do not even do small tweaks for committing.
- Keep the project structure super organized.
- Always use local ports to test before proceeding.
`;
fs.appendFileSync('.agents/AGENTS.md', content);
