import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enhanced Card Hover States
card_hover = '''
.pg-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

.pg-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.14);
}'''

# Find and replace .pg-card styles
content = re.sub(
    r'(\.pg-card\s*\{[^}]*)(border-radius:[^;]+;)',
    r'\1border-radius: var(--pg-radius-xl);\n  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;',
    content
)

# Add hover state if not exists
if '.pg-card:hover {' not in content:
    content = content.replace(
        '.pg-card.is-visible {',
        '''.pg-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.14);
}

.pg-card.is-visible {'''
    )

# 2. Typography Refinements
# Update title letter-spacing
content = re.sub(
    r'(\.pg__title\s*\{[^}]*letter-spacing:\s*)([^;]+)(;)',
    r'\1-0.02em\3',
    content
)

# Update filter pills
content = re.sub(
    r'(\.pg__filter\s*\{[^}]*)(padding:[^;]+;)',
    r'\1padding: 8px 16px;\n  letter-spacing: 0.02em;\n  font-weight: 600;',
    content
)

# 3. Modal Caption Enhancement
content = re.sub(
    r'(\.pg-modal__cap\s*\{[^}]*)(text-align:\s*center;)',
    r'\1text-align: center;\n  font-size: 13px;\n  line-height: 1.5;\n  letter-spacing: 0.01em;',
    content
)

# 4. Add smooth transitions to images
content = re.sub(
    r'(\.image-compare img\s*\{[^}]*)(object-fit:\s*cover;)',
    r'\1object-fit: cover;\n  transition: opacity 0.3s ease;',
    content
)

# 5. Enhanced masonry card hover
if '.pg-masonry__item:hover' not in content:
    content = content.replace(
        '.pg-masonry__media {',
        '''.pg-masonry__item {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.pg-masonry__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.pg-masonry__media {'''
    )

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 3 complete: Hover states and typography refinements applied")
