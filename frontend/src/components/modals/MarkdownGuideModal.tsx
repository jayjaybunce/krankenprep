import type { FC } from "react";
import { Modal } from "../Modal";
import { X as XIcon } from "lucide-react";
import { useTheme } from "../../hooks";
import { MarkdownRenderer } from "../MarkdownRenderer";

type MarkdownGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const markdownGuide = `# Markdown Guide

Use markdown to format your raid notes with rich text, links, and more.

## Basic Formatting

**Bold text** - Use \`**bold text**\` or \`__bold text__\`

*Italic text* - Use \`*italic text*\` or \`_italic text_\`

~~Strikethrough~~ - Use \`~~strikethrough~~\`

---

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Use \`#\` for headings. More \`#\` symbols = smaller heading.

---

## Lists

**Unordered Lists:**
- Item 1
- Item 2
- Item 3

Use \`-\`, \`*\`, or \`+\` for bullets.

**Ordered Lists:**
1. First item
2. Second item
3. Third item

Use numbers followed by a period.

---

## Links

[Link text](https://example.com)

Use \`[Link text](URL)\`

---

## Code

Inline code: \`const x = 10\`

Use backticks for inline code.

**Code Blocks:**

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

Use triple backticks with language name for syntax highlighting.

---

## Blockquotes

> This is a blockquote
> It can span multiple lines
> Great for highlighting important information

Use \`>\` at the start of each line.

---

## Tables

| Tank | Healer | DPS |
|------|--------|-----|
| Paladin | Priest | Mage |
| Warrior | Druid | Rogue |

Use pipes \`|\` and hyphens \`-\` to create tables.

---

## Images

![Alt text](image-url.jpg)

Use \`![Alt text](URL)\` to embed images. Click images to view full size.

---

## Horizontal Rules

Use three or more hyphens, asterisks, or underscores:

\`---\` or \`***\` or \`___\`
`;

export const MarkdownGuideModal: FC<MarkdownGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colorMode } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Markdown Formatting Guide"
      subtitle="Learn how to format your raid notes with markdown"
      variant="neon-gradient"
      size="full"
      actions={
        <button
          onClick={onClose}
          className={`
            px-4 py-2 rounded-xl font-medium font-montserrat
            transition-all duration-200
            ${
              colorMode === "dark"
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <XIcon className="w-4 h-4" />
            Close
          </div>
        </button>
      }
    >
      <div
        className={`
          p-6 rounded-xl overflow-y-auto
          ${
            colorMode === "dark"
              ? "bg-slate-900/50 border border-slate-700"
              : "bg-white border border-slate-300"
          }
        `}
        style={{
          height: "calc(90vh - 195px)",
        }}
      >
        <MarkdownRenderer>{markdownGuide}</MarkdownRenderer>
      </div>
    </Modal>
  );
};
