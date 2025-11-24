import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove close button styles completely
content = re.sub(
    r'\.pg-modal__close\s*\{[^}]+\}\s*\.pg-modal__close:hover\s*\{[^}]+\}',
    '',
    content,
    flags=re.DOTALL
)

# Remove close button pulse animation
content = re.sub(
    r'@keyframes closeButtonPulse\s*\{[^}]+\}',
    '',
    content,
    flags=re.DOTALL
)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed close button CSS")
