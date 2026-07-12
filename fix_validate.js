const fs = require('fs')
let code = fs.readFileSync('src/shared/utils/validate.test.ts', 'utf8')
if (!code.includes('isValidEmail')) {
  code =
    `import { isValidEmail, isValidPhone, isValidUrl, isPositiveNumber, maxLength } from './validate'\n` +
    code
}
fs.writeFileSync('src/shared/utils/validate.test.ts', code)
