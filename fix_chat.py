with open('src/features/chat/ChatWidget.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    if "const scrollToBottom = () => {" in line:
        pass
    new_lines.append(line)

# Let's use sed instead for this simple fix

