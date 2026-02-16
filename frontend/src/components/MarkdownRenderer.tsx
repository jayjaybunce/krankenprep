import type { FC } from "react";
import { useState } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "../hooks";
import {
  vs,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Modal } from "./Modal";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  className = "",
}) => {
  const { colorMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1
        className={`
          text-4xl font-bold mb-4 mt-6 font-montserrat
          bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent
        `}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`
          text-3xl font-bold mb-3 mt-5 font-montserrat
          ${colorMode === "dark" ? "text-cyan-300" : "text-cyan-600"}
        `}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`
          text-2xl font-semibold mb-3 mt-4 font-montserrat
          ${colorMode === "dark" ? "text-blue-300" : "text-blue-600"}
        `}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className={`
          text-xl font-semibold mb-2 mt-3 font-montserrat
          ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5
        className={`
          text-lg font-semibold mb-2 mt-3 font-montserrat
          ${colorMode === "dark" ? "text-slate-400" : "text-slate-600"}
        `}
      >
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6
        className={`
          text-base font-semibold mb-2 mt-2 font-montserrat
          ${colorMode === "dark" ? "text-slate-500" : "text-slate-500"}
        `}
      >
        {children}
      </h6>
    ),

    // Paragraph
    p: ({ children }) => (
      <p
        className={`
          mb-4 leading-relaxed
          ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul
        className={`
          list-disc list-inside mb-4 space-y-2
          ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`
          list-decimal list-inside mb-4 space-y-2
          ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="ml-4">{children}</li>,

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          font-medium underline decoration-2 underline-offset-2
          transition-all duration-200
          ${
            colorMode === "dark"
              ? "text-cyan-400 hover:text-cyan-300 decoration-cyan-500/50 hover:decoration-cyan-400"
              : "text-cyan-600 hover:text-cyan-700 decoration-cyan-300 hover:decoration-cyan-500"
          }
        `}
      >
        {children}
      </a>
    ),

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote
        className={`
          border-l-4 pl-4 py-2 mb-4 italic
          ${
            colorMode === "dark"
              ? "border-cyan-500 bg-slate-800/50 text-slate-300"
              : "border-cyan-400 bg-slate-100 text-slate-600"
          }
        `}
      >
        {children}
      </blockquote>
    ),

    // Code blocks
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      return !inline && language ? (
        <div className="mb-4 rounded-xl overflow-hidden">
          <SyntaxHighlighter
            style={colorMode === "dark" ? vscDarkPlus : vs}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0.75rem",
              padding: "1rem",
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className={`
            px-2 py-1 rounded-md font-mono text-sm
            ${
              colorMode === "dark"
                ? "bg-slate-800 text-cyan-300 border border-slate-700"
                : "bg-slate-200 text-cyan-700 border border-slate-300"
            }
          `}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Horizontal rule
    hr: () => (
      <hr
        className={`
          my-6 border-0 h-px
          ${colorMode === "dark" ? "bg-slate-700" : "bg-slate-300"}
        `}
      />
    ),

    // Table
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table
          className={`
            min-w-full border-collapse
            ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}
          `}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead
        className={`
          ${
            colorMode === "dark"
              ? "bg-slate-800 text-slate-200"
              : "bg-slate-200 text-slate-800"
          }
        `}
      >
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr
        className={`
          border-b
          ${colorMode === "dark" ? "border-slate-700" : "border-slate-300"}
        `}
      >
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => (
      <td
        className={`
          px-4 py-2
          ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {children}
      </td>
    ),

    // Strong and emphasis
    strong: ({ children }) => (
      <strong
        className={`
          font-bold
          ${colorMode === "dark" ? "text-cyan-300" : "text-cyan-700"}
        `}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em
        className={`
          italic
          ${colorMode === "dark" ? "text-blue-300" : "text-blue-600"}
        `}
      >
        {children}
      </em>
    ),

    // Deleted text
    del: ({ children }) => (
      <del
        className={`
          line-through
          ${colorMode === "dark" ? "text-slate-500" : "text-slate-400"}
        `}
      >
        {children}
      </del>
    ),

    // Images
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ""}
        onClick={() => setSelectedImage({ src: src || "", alt: alt || "" })}
        className={`
          max-w-full h-auto rounded-lg mb-4 cursor-pointer
          transition-all duration-200 hover:scale-[1.02]
          ${
            colorMode === "dark"
              ? "border border-slate-700 hover:border-cyan-500"
              : "border border-slate-300 hover:border-cyan-400"
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedImage({ src: src || "", alt: alt || "" });
          }
        }}
      />
    ),
  };

  return (
    <>
      <div className={`prose prose-sm max-w-none ${className}`}>
        <Markdown components={components}>{children}</Markdown>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.alt}
        size="full"
        centerContent
      >
        {selectedImage && (
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        )}
      </Modal>
    </>
  );
};
