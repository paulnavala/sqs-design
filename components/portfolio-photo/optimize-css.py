import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove duplicate font-size in modal caption
content = re.sub(
    r'(\.pg-modal__cap\s*\{[^}]*)(font-size:\s*14px;[^}]*)(font-size:\s*13px;)',
    r'\1\3',
    content
)

# 2. Consolidate duplicate border-radius in modal content
content = re.sub(
    r'(\.pg-modal__content\s*\{[^}]*)(border-radius:\s*20px;[^}]*)(border-radius:\s*12px;)',
    r'\1border-radius: 20px;',
    content
)

# 3. Remove empty animation keyframes if any
content = re.sub(r'@keyframes\s+\w+\s*\{\s*\}', '', content)

# 4. Optimize transitions - combine where possible
content = re.sub(
    r'transition:\s*transform\s+0\.3s\s+cubic-bezier\([^)]+\),\s*box-shadow\s+0\.3s\s+ease;',
    'transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;',
    content
)

# 5. Remove any duplicate empty lines (more than 2 consecutive)
content = re.sub(r'\n{4,}', '\n\n\n', content)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS optimized: removed duplicates and consolidated rules")
