import type { Dispatch, FC, SetStateAction } from "react";
import { useRef, useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon } from "lucide-react";
import { useTheme } from "../../hooks";
import { Textarea } from "../form";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { getCaretCoordinates } from "../../utils/caretPosition";
import SpellSearchAndSelection from "../SpellSearchAndSelection";

export type AddNoteForm = {
  content: string;
};

type AddSectionModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  title: string | null | undefined;
  onSave: (form: AddNoteForm) => void;
};

const defaultFormState: AddNoteForm = {
  content: "",
};

export const AddNoteModal: FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  title,
  onSave,
}) => {
  const { colorMode } = useTheme();
  const [formState, setFormState] = useState<AddNoteForm>(defaultFormState);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showBox, setShowBox] = useState<boolean>(false);
  const [iconQuery, setIconQuery] = useState("");
  const [iconSearchState, setIconSearchState] = useState({
    top: 0,
    left: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const handleFormChange = (key: string, value: string) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  const handleSearchResultClick = (
    spell_id: number,
    spell_name: string,
    icon_name: string,
  ) => {
    const spellMarkdown = `[${spell_name}](spell:${spell_id}/name:${icon_name})`;
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formState.content;
      // Find the `$query` that triggered the search and replace it
      const before = text.lastIndexOf("$", start);
      if (before !== -1) {
        const newContent =
          text.slice(0, before) + spellMarkdown + text.slice(end);
        handleFormChange("content", newContent);
      } else {
        // Fallback: insert at cursor
        const newContent =
          text.slice(0, start) + spellMarkdown + text.slice(end);
        handleFormChange("content", newContent);
      }
    }
    setShowBox(false);
    setIconQuery("");
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={`Add note to ${title}`}
      subtitle="Share resources with your teammates or anyone you want"
      variant="neon-gradient"
      size="full"
      actions={
        <>
          <button
            onClick={() => onClose(false)}
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
              Cancel
            </div>
          </button>
          <button
            onClick={() => {
              handleSave();
              setFormState(defaultFormState);
            }}
            // disabled={!acceptTerms || !teamName}
            className={`
              px-4 py-2 rounded-xl font-medium font-montserrat
              transition-all duration-200
              bg-gradient-to-r from-cyan-500 to-blue-600 text-white
              hover:shadow-lg hover:shadow-cyan-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {/* {isPending ? <LoaderCircle /> : "Create Team"} */}
            </div>
          </button>
        </>
      }
    >
      <div
        className="flex flex-row gap-4"
        style={{
          height: "calc(90vh - 195px)",
        }}
      >
        <div className="flex flex-col gap-2 w-full">
          <Textarea
            ref={contentRef}
            label="Add a brief content"
            value={formState.content}
            placeholder="Add markdown or text"
            onChange={(e) => {
              const value = e.target.value;
              const cursorPos = e.target.selectionStart;
              // Look backwards from cursor for a `$` trigger
              const textBeforeCursor = value.slice(0, cursorPos);
              const dollarIndex = textBeforeCursor.lastIndexOf("$");
              if (dollarIndex !== -1) {
                const query = textBeforeCursor.slice(dollarIndex + 1);
                // Only treat as active query if there's no space in it
                if (!query.includes("\n")) {
                  setShowBox(true);
                  setIconQuery(query);
                } else {
                  setShowBox(false);
                  setIconQuery("");
                }
              } else {
                setShowBox(false);
                setIconQuery("");
              }

              handleFormChange("content", e.target.value);
              if (contentRef.current == null) return;
              const caret = getCaretCoordinates(
                contentRef.current,
                contentRef.current?.selectionEnd,
              );
              const boundingRects = contentRef.current.getClientRects().item(0);
              if (boundingRects === null) return;
              setIconSearchState({
                ...caret,
                x: boundingRects.x,
                y: boundingRects.y,
              });
            }}
          />
        </div>
        <div className="flex flex-col w-full h-full">
          <label
            className={`
              block text-sm font-semibold mb-2 font-montserrat
              ${colorMode === "dark" ? "text-slate-300" : "text-slate-700"}
            `}
          >
            Preview
          </label>
          <div className="relative h-full">
            <div
              className={`
                p-4 rounded-xl border overflow-y-auto h-full
                ${
                  colorMode === "dark"
                    ? "bg-slate-900/50 border-slate-700"
                    : "bg-white border-slate-300"
                }
              `}
            >
              <MarkdownRenderer>{formState.content}</MarkdownRenderer>
            </div>
          </div>
        </div>
      </div>
      <SpellSearchAndSelection
        {...iconSearchState}
        onClick={handleSearchResultClick}
        show={showBox}
        query={iconQuery}
      />
    </Modal>
  );
};
