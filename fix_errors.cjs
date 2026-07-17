const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/err\.message/g, '(err as any).message');
    content = content.replace(/error\.message/g, '(error as any).message');
    content = content.replace(/err\.code/g, '(err as any).code');
    content = content.replace(/error\.code/g, '(error as any).code');
    content = content.replace(/err\?/g, '(err as any)?');
    content = content.replace(/error\?/g, '(error as any)?');
    fs.writeFileSync(file, content);
}

fixFile('src/features/properties/useProperties.ts');
fixFile('src/features/recommendations/useRecommendations.ts');
fixFile('src/shared/components/FeedbackModal.tsx');
fixFile('src/firebase.ts');
fixFile('src/features/admin/components/AdminAnalytics.tsx');
fixFile('src/features/properties/SearchView.tsx');
fixFile('src/features/chat/chatService.ts');
fixFile('src/features/recommendations/behaviorService.ts');
fixFile('src/main.tsx');
fixFile('src/analytics/index.ts');
