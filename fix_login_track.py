import re
with open("src/components/LoginModal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { loginWithGoogle, loginWithEmailPassword, signUpWithEmailPassword, sendPasswordReset } from "../firebase";',
    'import { loginWithGoogle, loginWithEmailPassword, signUpWithEmailPassword, sendPasswordReset, trackEvent } from "../firebase";'
)

content = content.replace(
    'const result = await loginWithGoogle();',
    'const result = await loginWithGoogle();\n      trackEvent("login", { method: "google" });'
)

content = content.replace(
    'const result = await loginWithEmailPassword(loginEmail, loginPassword);',
    'const result = await loginWithEmailPassword(loginEmail, loginPassword);\n      trackEvent("login", { method: "email" });'
)

content = content.replace(
    'const result = await signUpWithEmailPassword(signupName, signupEmail, signupPassword);',
    'const result = await signUpWithEmailPassword(signupName, signupEmail, signupPassword);\n      trackEvent("sign_up", { method: "email" });'
)

with open("src/components/LoginModal.tsx", "w") as f:
    f.write(content)
