import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enhanced masonry item hover with smooth scale and shadow
masonry_item_hover = '''.pg-masonry__item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 50px rgba(210, 154, 132, 0.22), 0 0 0 1px rgba(210, 154, 132, 0.1);
  z-index: 2;
}'''

content = re.sub(
    r'\.pg-masonry__item:hover\s*\{[^}]+\}',
    masonry_item_hover,
    content
)

# 2. Add smooth image scale on hover
image_hover = '''
.pg-masonry__item:hover .pg-masonry__img {
  transform: scale(1.05);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.12s ease;
}'''

if '.pg-masonry__item:hover .pg-masonry__img' not in content:
    content = content.replace(
        '.pg-masonry__media.is-loading .pg-masonry__img {',
        image_hover + '\n\n.pg-masonry__media.is-loading .pg-masonry__img {'
    )

# 3. Update image transition for smooth scale
content = re.sub(
    r'(\.pg-masonry__img\s*\{[^}]*)(transition:\s*opacity[^;]+;)',
    r'\1transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.12s ease;',
    content
)

# 4. Enhanced fullscreen button with better visibility
fs_button = '''.pg-masonry__fs {
  position: absolute;
  right: 12px;
  bottom: 12px;
  appearance: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  transform: scale(0.8);
  z-index: 3;
}

.pg-masonry__media:hover .pg-masonry__fs,
.pg-masonry__media:focus-within .pg-masonry__fs {
  opacity: 1;
  transform: scale(1);
}

.pg-masonry__fs:hover {
  background: #111;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}'''

# Find and replace fullscreen button
content = re.sub(
    r'\.pg-masonry__fs\s*\{[^}]+\}',
    fs_button,
    content,
    count=1
)

# 5. Enhanced title overlay
title_overlay = '''.pg-masonry__title {
  position: absolute;
  left: 12px;
  bottom: 12px;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--pg-ink-strong);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 8px 14px;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pg-masonry__item:hover .pg-masonry__title {
  opacity: 1;
  transform: translateY(0);
}'''

content = re.sub(
    r'\.pg-masonry__title\s*\{[^}]+\}',
    title_overlay,
    content,
    count=1
)

# 6. Add subtle gradient overlay on hover
overlay_css = '''
.pg-masonry__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.pg-masonry__item:hover .pg-masonry__media::after {
  opacity: 1;
}'''

if '.pg-masonry__media::after' not in content:
    content = content.replace(
        '.pg-masonry__media {',
        overlay_css + '\n\n.pg-masonry__media {'
    )

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Grid UI/UX improvements applied successfully")
