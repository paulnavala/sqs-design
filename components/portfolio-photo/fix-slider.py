import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the corrupted slider CSS - replace the merged section
corrupted_section = r'\.image-compare-wrapper,\s*\.image-compare-handle\s*\{[^}]+\}\s*\.image-compare-handle:hover\s*\{[^}]+\}\s*\.image-compare-wrapper\s*\{'

fixed_css = '''.image-compare-wrapper,
.image-compare-handle {
  bottom: 0;
  position: absolute;
  top: 0;
}

.image-compare-wrapper {'''

content = re.sub(corrupted_section, fixed_css, content, flags=re.DOTALL)

# Now add the handle styles separately
handle_section = r'(\.image-compare-wrapper\s*\{[^}]+\})'

handle_css = r'''\1

.image-compare-handle {
  color: #fff;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  cursor: ew-resize;
  transform: translateX(-50%) translateZ(0);
  width: 3px;
  z-index: 2;
  will-change: left;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 12px rgba(255, 255, 255, 0.4);
}

.image-compare-handle:hover {
  width: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3);
}'''

# Only add if not already present
if '.image-compare-handle {' not in content.split('.image-compare-wrapper {')[1].split('.image-compare-handle-icon')[0]:
    content = re.sub(handle_section, handle_css, content)

# Remove transition from handle to fix lag
content = re.sub(
    r'(\.image-compare-handle\s*\{[^}]*)(transition:[^;]+;)',
    r'\1',
    content
)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed: Slider CSS corruption and removed transition lag")
