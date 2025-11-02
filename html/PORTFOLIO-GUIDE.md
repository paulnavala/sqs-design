# Portfolio Component - Adding Projects Guide

This guide makes it easy to add new projects to your Portfolio UI/UX component.

## Quick Start

1. **Open** `html/portfolio-uiux-loader.html`
2. **Find** the `<ul id="projects-data">` section
3. **Copy** the template entry (it's commented out in the file)
4. **Fill in** your project data
5. **Paste** it into the list

## Required Fields

Every project entry needs these three fields:

- `data-id` - Unique identifier (e.g., "my-project")
- `data-title` - Project title shown on the card
- `data-figma` - Full Figma prototype URL

## Optional Fields

- `data-description` - Brief description (1-2 sentences)
- `data-case` - Link to case study page (e.g., "/projects/my-project")
- `data-badges` - Display badges separated by `|` or `,` (e.g., "Prototype|Figma")
- `data-categories` - Filter categories separated by `|` or `,` (must match filter buttons!)
- `data-year` - Year for caption (defaults to current year if not specified)
- `data-accent` - Custom accent color hex code (e.g., "#D29A84")

## Entry Template

```html
<li
  data-id="project-identifier"
  data-title="Project Title"
  data-description="Brief description of the project."
  data-figma="https://www.figma.com/proto/YOUR_URL"
  data-case="/projects/your-slug"
  data-badges="Badge1|Badge2|Badge3"
  data-categories="category1|category2"
  data-year="2025"
  data-accent="#D29A84"
></li>
```

## Examples

### Minimal Entry
```html
<li
  data-id="my-project"
  data-title="My Project"
  data-figma="https://www.figma.com/proto/abc123/..."
></li>
```

### Full Entry
```html
<li
  data-id="app-redesign"
  data-title="Mobile App Redesign"
  data-description="A complete redesign focusing on user flow and accessibility."
  data-figma="https://www.figma.com/proto/abc123/..."
  data-case="/projects/app-redesign"
  data-badges="Prototype|Mobile|Figma"
  data-categories="prototype|mobile"
  data-year="2024"
  data-accent="#58433B"
></li>
```

## Field Details

### `data-id`
- Unique identifier used internally
- Format: lowercase, use hyphens (e.g., "cern-01", "app-redesign")
- Must be unique across all projects
- **Required**

### `data-title`
- The project title displayed prominently on the card
- **Required**

### `data-description`
- Brief description (1-2 sentences)
- Appears below the title on the card
- Keep it concise and compelling
- Optional but recommended

### `data-figma`
- Full Figma prototype URL
- Can be a share link or embed link
- Will be automatically converted to embed format
- **Required**

### `data-case`
- Internal link to full case study page
- Format: "/projects/your-slug" or full URL
- Use "#" to disable the link
- Optional

### `data-badges`
- Display badges separated by `|` or `,`
- Examples: `"Prototype|Figma"`, `"Design System, Motion"`
- Multiple badges will be rendered as separate badge elements
- Optional

### `data-categories`
- Used for filtering projects
- Separated by `|` or `,`
- **Must match filter button values** in the `portfolio__filters` section
- Examples: `"prototype|cern"`, `"mobile,web"`
- If you add a new category, don't forget to add a filter button!
- Optional (but needed for filtering)

### `data-year`
- Year displayed in the caption below the card
- Defaults to current year if not specified
- Optional

### `data-accent`
- Custom accent color (hex code)
- Used for the accent bar and badge dot
- Examples: `"#D29A84"`, `"#58433B"`
- If empty or omitted, uses default clay color (`--clay`)
- Optional

## Using the Generator Tool

We've included an interactive CLI tool to help you create entries:

```bash
node scripts/generate-portfolio-entry.js
```

This will:
- Prompt you for each field
- Generate the HTML for you
- Handle formatting automatically
- Show you exactly what to copy/paste

## Adding Filter Buttons

If you're using new categories, make sure to add filter buttons in the `portfolio__filters` section:

```html
<nav class="portfolio__filters" aria-label="Project filters">
  <button class="pill is-active" data-filter="all" aria-pressed="true">All</button>
  <button class="pill" data-filter="prototype" aria-pressed="false">Prototypes</button>
  <button class="pill" data-filter="cern" aria-pressed="false">CERN</button>
  <!-- Add your new filter here -->
  <button class="pill" data-filter="mobile" aria-pressed="false">Mobile</button>
</nav>
```

The `data-filter` value must match the categories you use in your project entries!

## Tips

- **Keep IDs unique**: Use descriptive IDs like "project-name-01" if you have multiple versions
- **Use consistent categories**: Pick a set of categories and stick to them for easier filtering
- **Badge styling**: Keep badges short (1-2 words) for best appearance
- **Descriptions**: Aim for 1-2 sentences. Too long and they'll look cramped.
- **Figma URLs**: Any Figma URL will work - share links, embed links, etc. The component handles conversion.

## Troubleshooting

**Project not showing up?**
- Check that `data-id`, `data-title`, and `data-figma` are all filled in
- Make sure the entry is inside the `<ul id="projects-data">` section

**Filter not working?**
- Ensure the category in `data-categories` matches the `data-filter` value in the button
- Categories are case-sensitive

**Badges not displaying?**
- Check that `data-badges` uses `|` or `,` to separate badges
- Make sure there are no extra spaces around the separators

**Colors not working?**
- Accent colors must be valid hex codes (e.g., "#D29A84")
- Include the `#` symbol
- Use uppercase or lowercase (both work)

## Need Help?

- See `html/PORTFOLIO-ENTRY-TEMPLATE.html` for detailed examples
- Check the template entry in `html/portfolio-uiux-loader.html` (commented out)
- Run the generator tool: `node scripts/generate-portfolio-entry.js`

