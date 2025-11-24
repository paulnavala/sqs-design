import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Move fullscreen button to center
fs_button_center = '''.pg-masonry__fs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  appearance: none;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  z-index: 3;
}

.pg-masonry__media:hover .pg-masonry__fs,
.pg-masonry__media:focus-within .pg-masonry__fs {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.pg-masonry__fs:hover {
  background: #111;
  color: #fff;
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}'''

# Replace fullscreen button CSS
content = re.sub(
    r'\.pg-masonry__fs\s*\{[^}]+\}\s*\.pg-masonry__media:hover \.pg-masonry__fs[^}]+\}\s*\.pg-masonry__fs:hover\s*\{[^}]+\}',
    fs_button_center,
    content,
    flags=re.DOTALL
)

# 2. Move title to top left
title_top_left = '''.pg-masonry__title {
  position: absolute;
  left: 12px;
  top: 12px;
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
  transform: translateY(-8px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pg-masonry__item:hover .pg-masonry__title {
  opacity: 1;
  transform: translateY(0);
}'''

content = re.sub(
    r'\.pg-masonry__title\s*\{[^}]+\}\s*\.pg-masonry__item:hover \.pg-masonry__title\s*\{[^}]+\}',
    title_top_left,
    content,
    flags=re.DOTALL
)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Repositioned: Fullscreen button to center, title to top left")
