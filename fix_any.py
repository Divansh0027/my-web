import os
import re

for root, dirs, files in os.walk('src/components/admin'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Very basic replacements for commonly seen `any`
            # EnquiriesManagement.tsx 112:106  (e: any)
            content = re.sub(r'\(e: any\)', '(e: unknown)', content)
            content = re.sub(r'\(prev: any\)', '(prev)', content) # React setter prev is typed implicitly if possible, else we should give it type
            content = re.sub(r'\(p: any\)', '(p)', content)
            
            with open(filepath, 'w') as f:
                f.write(content)
