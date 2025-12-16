import type { Dispatch, FC, SetStateAction } from "react";
import { useReducer, useState } from "react";
import { Modal } from "../Modal";
import {
  User,
  Shield,
  Sword,
  Heart,
  Zap,
  Save,
  X as XIcon,
  LucideChartNoAxesCombined,
  Signature,
  LoaderCircle,
} from "lucide-react";
import { useApi, useTheme } from "../../hooks";
import { Dropdown, Textarea, TextInput } from "../form";
import { useQuery } from "@tanstack/react-query";
import { type Server } from "../../types/api/server";
import { type Region } from "../../types/api/region";
import type { DropdownOption } from "../form/Dropdown";
import { useRegions, useServers } from "../../api/queryHooks";
import { useCreateTeam } from "../../api/mutationHooks";
import { Card } from "../Card";
import { MarkdownRenderer } from "../MarkdownRenderer";

export type AddNoteForm = {
  sectionName: string;
  variant: string | string[];
  description: string;
  tags: string[];
  tagInput: string;
};

type AddSectionModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  title: string | null | undefined;
  onSave: (form: AddNoteForm) => void;
};

const defaultFormState: AddNoteForm = {
  sectionName: "",
  variant: "neon-gradient",
  description: "",
  tags: [],
  tagInput: "",
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

  const handleAddTag = () => {
    if (
      formState.tagInput.trim() &&
      !formState.tags.includes(formState.tagInput.trim())
    ) {
      setFormState((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, formState.tagInput.trim()],
        tagInput: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormState((prevState) => ({
      ...prevState,
      tags: prevState.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(formState);
  };

  const cardVariants = [
    "default",
    "elevated",
    "gradient",
    "bordered",
    "solid",
    "neon",
    "neon-gradient",
    "outlined",
    "success",
    "warning",
    "danger",
  ];

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
            label="Add a brief description"
            value={formState.description}
            placeholder="Add markdown or text"
            onChange={(e) => handleFormChange("description", e.target.value)}
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
              <MarkdownRenderer>{formState.description}</MarkdownRenderer>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
