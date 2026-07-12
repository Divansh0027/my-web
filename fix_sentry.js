const fs = require('fs')
let content = fs.readFileSync('src/main.tsx', 'utf8')
content = content.replace(
  'if (sentryDsn) {',
  'if (sentryDsn && (sentryDsn.startsWith("http://") || sentryDsn.startsWith("https://"))) {\n  try {',
)
content = content.replace(
  '  })\n}',
  '  })\n  } catch (error) {\n    console.warn("Failed to initialize Sentry:", error);\n  }\n}',
)
fs.writeFileSync('src/main.tsx', content)
