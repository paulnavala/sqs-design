# Code Standards & Best Practices

This document outlines coding standards and best practices for the Squarespace Design Components codebase.

## 📝 Commenting Standards

### File Headers
Every major file should start with a JSDoc-style header:

```javascript
/**
 * Module/Component Name
 * 
 * Brief description of what this file does.
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Usage:
 *   Example usage here
 * 
 * @module module-name
 */
```

### Function Documentation
All functions should have clear comments explaining:
- **Purpose**: What the function does
- **Parameters**: What inputs it expects
- **Returns**: What it returns
- **Side Effects**: Any external changes

```javascript
/**
 * Brief description of function
 * 
 * More detailed explanation if needed.
 * 
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter
 * @returns {Type} Return value description
 * @throws {Error} When and why errors are thrown
 */
```

### Inline Comments
Use inline comments to explain:
- **Why**, not what (code should be self-documenting)
- Complex logic or algorithms
- Workarounds for browser/platform issues
- Non-obvious optimizations

```javascript
// ✅ Good: Explains why
// Debounce to prevent excessive API calls during rapid scrolling

// ❌ Bad: States the obvious
// Loop through array
for (let i = 0; i < array.length; i++) {
```

## 🏗️ Code Organization

### Module Structure
1. **Configuration** - Constants and config at top
2. **Utility Functions** - Helper functions
3. **Core Functions** - Main functionality
4. **Initialization** - Setup and event listeners
5. **Public API** - Exposed functions/objects

### Naming Conventions
- **Files**: `kebab-case` (e.g., `component-loader.js`)
- **Functions**: `camelCase` (e.g., `loadComponent`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `BASE_URL`)
- **Classes**: `PascalCase` (e.g., `ComponentLoader`)
- **CSS Classes**: `kebab-case` (e.g., `component-container`)

### Function Length
- Keep functions focused and under 50 lines
- Extract complex logic into separate functions
- Use descriptive function names

## 🔒 Error Handling

### Always Handle Errors
```javascript
// ✅ Good: Proper error handling
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.text();
  })
  .catch(error => {
    console.error('Failed to load:', error);
    // Handle gracefully
  });

// ❌ Bad: No error handling
fetch(url).then(data => use(data));
```

### Validation
- Validate inputs at function boundaries
- Provide clear error messages
- Fail fast with descriptive errors

## 🎯 Performance

### Optimization Principles
1. **Measure First** - Profile before optimizing
2. **Lazy Loading** - Load resources when needed
3. **Debouncing/Throttling** - For scroll/resize handlers
4. **Event Delegation** - For dynamic content
5. **Minimize DOM Queries** - Cache selectors

### Example: Event Delegation
```javascript
// ✅ Good: Event delegation
document.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e.target);
  }
});

// ❌ Bad: Individual listeners
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handleClick);
});
```

## 📦 Modularity

### Single Responsibility
Each function should do one thing well:

```javascript
// ✅ Good: Focused functions
function validateProject(project) {
  // Only validation logic
}

function generateHtml(project) {
  // Only HTML generation
}

// ❌ Bad: Too many responsibilities
function processProject(project) {
  // Validates, generates HTML, updates DOM, sends analytics...
}
```

### Reusability
- Extract common patterns into utilities
- Use parameters for flexibility
- Avoid hard-coded values

## 🧪 Testing Considerations

### Testable Code
- Pure functions (no side effects) when possible
- Dependency injection for external services
- Clear input/output contracts

### Error Scenarios
- Test edge cases
- Test with invalid inputs
- Test error recovery

## 🔐 Security

### XSS Prevention
- Always escape user input
- Use `textContent` instead of `innerHTML` when possible
- Validate and sanitize data

```javascript
// ✅ Good: Escaped output
element.textContent = userInput;
// Or
element.innerHTML = escapeHtml(userInput);

// ❌ Bad: Direct HTML injection
element.innerHTML = userInput;
```

### Data Validation
- Validate all external data
- Never trust user input
- Use strict equality (`===`)

## 📱 Browser Compatibility

### Progressive Enhancement
- Core functionality works without JS
- Enhance with JavaScript
- Feature detection over browser detection

```javascript
// ✅ Good: Feature detection
if ('IntersectionObserver' in window) {
  // Use modern API
} else {
  // Fallback
}

// ❌ Bad: Browser detection
if (navigator.userAgent.includes('Chrome')) {
  // Won't work in other Chromium browsers
}
```

## 🎨 CSS Guidelines

### Organization
- Use logical grouping
- BEM or similar naming convention
- Comment complex layouts

```css
/* ✅ Good: Organized and commented */
/* Header Styles */
.header {
  /* Layout */
  display: flex;
  align-items: center;
  
  /* Spacing */
  padding: 1rem 2rem;
}

/* ❌ Bad: Unclear structure */
.header { display: flex; align-items: center; padding: 1rem 2rem; }
```

## 📚 Documentation

### Keep Docs Updated
- Update README when adding features
- Document breaking changes
- Include usage examples

### Code Comments
- Write for future maintainers
- Explain intent, not implementation
- Keep comments in sync with code

## 🚀 Scalability

### Design for Growth
- Use configuration over hard-coding
- Support multiple instances
- Avoid global state when possible

### Performance at Scale
- Consider lazy loading for large datasets
- Use pagination/virtual scrolling
- Optimize critical rendering path

## ✅ Checklist

Before committing code, ensure:
- [ ] Functions are documented
- [ ] Error handling is in place
- [ ] Code follows naming conventions
- [ ] No hard-coded values (use constants)
- [ ] Security considerations addressed
- [ ] Browser compatibility checked
- [ ] Performance implications considered

---

**Remember**: Code is read more than it's written. Write for humans first, machines second.

