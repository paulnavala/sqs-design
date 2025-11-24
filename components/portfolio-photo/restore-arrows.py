import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore original simple arrow icons (‹ and ›) without circular backgrounds
icon_css = '''.image-compare-handle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 2rem;
  color: currentColor;
  line-height: normal;
}'''

content = re.sub(
    r'\.image-compare-handle-icon\s*\{[^}]+\}',
    icon_css,
    content,
    count=1
)

# Remove hover transform on icons
content = re.sub(
    r'\.image-compare-handle:hover \.image-compare-handle-icon\s*\{[^}]+\}',
    '',
    content
)

# Restore original icon positioning
left_icon = '''.image-compare-handle-icon.left {
  padding-right: 10px;
  transform: translate(-100%, -50%);
}'''

right_icon = '''.image-compare-handle-icon.right {
  padding-left: 10px;
  transform: translate(0, -50%);
}'''

content = re.sub(r'\.image-compare-handle-icon\.left\s*\{[^}]+\}', left_icon, content)
content = re.sub(r'\.image-compare-handle-icon\.right\s*\{[^}]+\}', right_icon, content)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored original slider arrows")
