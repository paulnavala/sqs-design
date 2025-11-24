import re

# Read the CSS file
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enhanced Modal Backdrop
content = re.sub(
    r'\.pg-modal__backdrop\s*\{[^}]+\}',
    '''.pg-modal__backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.75));
  backdrop-filter: blur(12px) saturate(120%);
  animation: backdropFadeIn 0.3s ease;
}

@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}''',
    content,
    flags=re.DOTALL
)

# 2. Modal Content Animation
content = re.sub(
    r'(\.pg-modal__content\s*\{[^}]*)(box-shadow:[^;]+;)',
    r'\1box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.5);\n  animation: modalScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);',
    content
)

# Add modal animation keyframes after modal content
modal_animation = '''

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}'''

if '@keyframes modalScaleIn' not in content:
    content = content.replace('.pg-modal__close {', modal_animation + '\n\n.pg-modal__close {')

# 3. Enhanced Close Button with pulse hint
content = re.sub(
    r'(\.pg-modal__close\s*\{[^}]*)(z-index:\s*10;)',
    r'\1z-index: 10;\n  animation: closeButtonPulse 2s ease 0.5s;',
    content
)

close_pulse = '''

@keyframes closeButtonPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
}'''

if '@keyframes closeButtonPulse' not in content:
    content = content.replace('@keyframes modalScaleIn', close_pulse + '\n\n@keyframes modalScaleIn')

# 4. Image Container Enhancement
content = re.sub(
    r'(\.pg-modal__view\s*\{[^}]*)(overflow:\s*hidden;)',
    r'\1overflow: hidden;\n  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 2px 8px rgba(0, 0, 0, 0.08);',
    content
)

# Write back
with open('d:/Stuff/Pati/Peachless/source/sqs-design/components/portfolio-photo/portfolio-photo.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 1 complete: Modal and container enhancements applied")
