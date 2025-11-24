import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match both .pg-modal__close rules
pattern = r'\.pg-modal__close\s*\{[^}]+\}\s*\n\s*\.pg-modal__close:hover\s*\{[^}]+\}'

# New CSS - close button positioned outside the content, relative to modal
new_css = '''.pg-modal__close {
  position: absolute;
  top: -16px;
  right: -16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #333;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  font-weight: 400;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.pg-modal__close:hover {
  background: #111;
  color: #fff;
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}'''

# Replace
content = re.sub(pattern, new_css, content, flags=re.DOTALL)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS updated - close button now positioned outside photo container")
