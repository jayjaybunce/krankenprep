import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { Modal } from "../Modal";
import { Save, X as XIcon } from "lucide-react";
import { useTheme } from "../../hooks";
import { Textarea } from "../form";
import { MarkdownRenderer } from "../MarkdownRenderer";

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

  const handleFormChange = (key: string, value: any) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
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
            label="Add a brief content"
            value={formState.content}
            placeholder="Add markdown or text"
            onChange={(e) => handleFormChange("content", e.target.value)}
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
    </Modal>
  );
};
