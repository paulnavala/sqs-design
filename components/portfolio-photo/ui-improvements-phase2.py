import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enhanced Slider Handle with gradient and glow
handle_css = '''.image-compare-handle {
  color: #fff;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  cursor: ew-resize;
  transform: translateX(-50%) translateZ(0);
  width: 3px;
  z-index: 2;
  will-change: left;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.image-compare-handle:hover {
  width: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3);
}'''

content = re.sub(
    r'\.image-compare-handle\s*\{[^}]+\}',
    handle_css,
    content,
    count=1
)

# 2. Enhanced Handle Icons with circular background
icon_css = '''.image-compare-handle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 1.5rem;
  color: #333;
  line-height: 1;
  background: rgba(255, 255, 255, 0.95);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.image-compare-handle:hover .image-compare-handle-icon {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
}'''

content = re.sub(
    r'\.image-compare-handle-icon\s*\{[^}]+\}',
    icon_css,
    content,
    count=1
)

# 3. Update icon positioning
left_icon = '''.image-compare-handle-icon.left {
  transform: translate(calc(-100% - 8px), -50%);
}'''

right_icon = '''.image-compare-handle-icon.right {
  transform: translate(8px, -50%);
}'''

content = re.sub(r'\.image-compare-handle-icon\.left\s*\{[^}]+\}', left_icon, content)
content = re.sub(r'\.image-compare-handle-icon\.right\s*\{[^}]+\}', right_icon, content)

# 4. Add Before/After Labels (insert after image-compare-handle-icon.right)
labels_css = '''

/* Before/After Labels */
.image-compare-label {
  position: absolute;
  top: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #333;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 8px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: 3;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-compare-label.before {
  left: 20px;
}

.image-compare-label.after {
  right: 20px;
}

.image-compare.is-dragging .image-compare-label {
  opacity: 0;
  transform: scale(0.9);
}'''

if '.image-compare-label' not in content:
    content = content.replace(
        '.image-compare-handle-icon.right {',
        labels_css + '\n\n.image-compare-handle-icon.right {'
    )

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 2 complete: Slider handle and labels enhanced")
