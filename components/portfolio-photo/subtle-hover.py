import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Subtle card hover - reduce lift and scale
subtle_card_hover = '''.pg-masonry__item:hover {
  transform: translateY(-2px) scale(1.005);
  box-shadow: 0 12px 32px rgba(210, 154, 132, 0.14), 0 0 0 1px rgba(210, 154, 132, 0.06);
  z-index: 2;
}'''

content = re.sub(
    r'\.pg-masonry__item:hover\s*\{[^}]+\}',
    subtle_card_hover,
    content
)

# 2. Subtle image zoom - reduce scale
subtle_image_zoom = '''
.pg-masonry__item:hover .pg-masonry__img {
  transform: scale(1.02);
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.12s ease;
}'''

content = re.sub(
    r'\.pg-masonry__item:hover \.pg-masonry__img\s*\{[^}]+\}',
    subtle_image_zoom,
    content
)

# 3. Update image transition for smoother effect
content = re.sub(
    r'(\.pg-masonry__img\s*\{[^}]*)(transition:\s*transform[^;]+;)',
    r'\1transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.12s ease;',
    content
)

# 4. Subtle gradient overlay
subtle_overlay = '''
.pg-masonry__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.25));
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.pg-masonry__item:hover .pg-masonry__media::after {
  opacity: 1;
}'''

content = re.sub(
    r'\.pg-masonry__media::after\s*\{[^}]+\}\s*\.pg-masonry__item:hover \.pg-masonry__media::after\s*\{[^}]+\}',
    subtle_overlay,
    content,
    flags=re.DOTALL
)

# 5. Subtle fullscreen button
subtle_fs_button = '''.pg-masonry__fs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  appearance: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.25s ease;
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
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}'''

content = re.sub(
    r'\.pg-masonry__fs\s*\{[^}]+\}\s*\.pg-masonry__media:hover \.pg-masonry__fs[^}]+\}\s*\.pg-masonry__fs:hover\s*\{[^}]+\}',
    subtle_fs_button,
    content,
    flags=re.DOTALL
)

# 6. Subtle title animation
subtle_title = '''.pg-masonry__title {
  position: absolute;
  left: 12px;
  top: 12px;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--pg-ink-strong);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 8px 14px;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.25s ease;
}

.pg-masonry__item:hover .pg-masonry__title {
  opacity: 1;
  transform: translateY(0);
}'''

content = re.sub(
    r'\.pg-masonry__title\s*\{[^}]+\}\s*\.pg-masonry__item:hover \.pg-masonry__title\s*\{[^}]+\}',
    subtle_title,
    content,
    flags=re.DOTALL
)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Hover effects made more subtle and refined")
