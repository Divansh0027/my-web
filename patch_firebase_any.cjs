const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  "let app: any",
  "import type { FirebaseApp } from 'firebase/app';\nlet app: FirebaseApp | undefined"
);

content = content.replace(
  "export let analyticsInstance: any = undefined",
  "import type { Analytics } from 'firebase/analytics';\nexport let analyticsInstance: Analytics | undefined = undefined"
);

content = content.replace(
  "let messagingInstance: any = null",
  "import type { Messaging, MessagePayload } from 'firebase/messaging';\nlet messagingInstance: Messaging | null = null"
);

content = content.replace(
  "export const onMessageListener = (callback: (payload: any) => void) => {",
  "export const onMessageListener = (callback: (payload: MessagePayload) => void) => {"
);

content = content.replace(
  "export const subscribeRemoteControls = (callback: (controls: any) => void): (() => void) => {",
  "export const subscribeRemoteControls = (callback: (controls: Record<string, boolean>) => void): (() => void) => {"
);

content = content.replace(
  "export const updateRemoteControls = async (controls: any): Promise<boolean> => {",
  "export const updateRemoteControls = async (controls: Record<string, boolean>): Promise<boolean> => {"
);

content = content.replace(
  "export const subscribeRemoteSettings = (callback: (settings: any) => void): (() => void) => {",
  "import type { AdminSettings } from '@/shared/types/types';\nexport const subscribeRemoteSettings = (callback: (settings: AdminSettings) => void): (() => void) => {"
);

content = content.replace(
  "export const updateRemoteSettings = async (settings: any): Promise<boolean> => {",
  "export const updateRemoteSettings = async (settings: AdminSettings): Promise<boolean> => {"
);

fs.writeFileSync('src/firebase.ts', content);
