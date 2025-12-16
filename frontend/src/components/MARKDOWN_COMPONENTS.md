# Custom Markdown Components

The `MarkdownRenderer` component provides a fully styled markdown preview with syntax highlighting and theme support.

## Features

- **Theme-aware**: Automatically adapts to light/dark mode using your app's `useTheme` hook
- **Syntax highlighting**: Code blocks with language-specific highlighting via `react-syntax-highlighter`
- **Custom styling**: All markdown elements are styled with Tailwind CSS to match your app's design
- **Gradient headings**: H1 headings use a cyan-to-blue gradient
- **Responsive tables**: Tables with proper overflow handling
- **Custom typography**: Uses Montserrat font family for headings

## Usage

```tsx
import { MarkdownRenderer } from '../MarkdownRenderer';

function MyComponent() {
  const markdownContent = `
# Hello World

This is a **bold** statement with *italic* text.

## Code Example

\`\`\`typescript
const greet = (name: string) => {
  return \`Hello, \${name}!\`;
};
\`\`\`

- Item 1
- Item 2
- Item 3
  `;

  return <MarkdownRenderer>{markdownContent}</MarkdownRenderer>;
}
```

## Supported Elements

### Headings
- H1 through H6 with gradient/colored styling

### Text Formatting
- **Bold** text
- *Italic* text
- ~~Strikethrough~~ text

### Lists
- Unordered lists (bullets)
- Ordered lists (numbers)

### Links
- External links with hover effects
- Opens in new tab with security attributes

### Code
- Inline code blocks
- Multi-line code blocks with syntax highlighting
- Supports all major programming languages

### Blockquotes
- Styled with left border and background

### Tables
- Responsive tables with proper styling
- Headers and data cells

### Horizontal Rules
- Styled dividers

## Example Markdown

Try this in the AddNoteModal:

```markdown
# Boss Strategy Guide

## Phase 1: Opening

Start by positioning the **tank** at the north marker.

> **Important**: Make sure healers are ready for the tank buster!

### Abilities to Watch

- Cleave (frontal cone)
- Tankbuster (every 30s)
- Raid-wide AoE (every 45s)

## Code Example

\`\`\`javascript
const calculateDPS = (damage, time) => {
  return damage / time;
};
\`\`\`

## Resources

Check out [this guide](https://example.com) for more information.

---

*Good luck!*
```

## Customization

The component uses your app's theme context automatically. To customize colors or styles, edit the `MarkdownRenderer.tsx` file and adjust the Tailwind classes in the `components` object.
