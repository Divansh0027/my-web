const fs = require('fs');
let code = fs.readFileSync('src/shared/components/common/Layout.tsx', 'utf8');

if (!code.includes('InstallPrompt')) {
    code = code.replace(
        "import Notification from '@/shared/components/Notification'",
        "import Notification from '@/shared/components/Notification'\nimport { InstallPrompt } from '@/shared/components/InstallPrompt'"
    );

    code = code.replace(
        "<Notification message={toastMessage} type={toastType} onClose={closeToast} />",
        "<Notification message={toastMessage} type={toastType} onClose={closeToast} />\n        <InstallPrompt />"
    );

    fs.writeFileSync('src/shared/components/common/Layout.tsx', code);
    console.log("Injected InstallPrompt");
}
