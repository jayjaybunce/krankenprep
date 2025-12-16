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
import Markdown from "react-markdown";
import Badge from "../Badge";
import { Plus, X } from "lucide-react";

export type AddSectionForm = {
  sectionName: string;
  variant: string | string[];
  description: string;
  tags: string[];
  tagInput: string;
  notes?: string;
};

type AddSectionModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  title: string | null | undefined;
  onSave: (form: AddSectionForm) => void;
};

const defaultFormState: AddSectionForm = {
  sectionName: "",
  variant: "neon-gradient",
  description: "",
  tags: [],
  tagInput: "",
};

export const AddSectionModal: FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  title,
  onSave,
}) => {
  const { colorMode } = useTheme();
  const [formState, setFormState] = useState<AddSectionForm>(defaultFormState);

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
      title={`Add section to ${title}`}
      subtitle="Share resources with your teammates or anyone you want"
      variant="neon-gradient"
      size="xl"
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <TextInput
            value={formState.sectionName}
            variant="minimal"
            className="font-montserrat"
            label="Name Your Section"
            placeholder="...."
            onChange={(e) => handleFormChange("sectionName", e.target.value)}
          />
          <Textarea
            label="Add a brief description"
            value={formState.description}
            placeholder="Add a desciption"
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-montserrat text-slate-700 dark:text-slate-300">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formState.tags.map((tag) => (
              <div
                key={tag}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  colorMode === "dark"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                    : "bg-cyan-100 text-cyan-700 border border-cyan-300"
                }`}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-cyan-500/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput
              value={formState.tagInput}
              variant="minimal"
              className="font-montserrat flex-1"
              placeholder="Add a tag..."
              onChange={(e) => handleFormChange("tagInput", e.target.value)}
              onKeyDown={handleTagInputKeyPress}
            />
            <button
              onClick={handleAddTag}
              className={`
                px-4 py-2 rounded-xl font-medium font-montserrat
                transition-all duration-200
                ${
                  colorMode === "dark"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30"
                    : "bg-cyan-100 text-cyan-700 border border-cyan-300 hover:bg-cyan-200"
                }
              `}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <Dropdown
            label="Variant"
            value={formState.variant}
            // disabled={formState.region == ""}
            onChange={(e) => handleFormChange("variant", e)}
            searchable
            options={cardVariants.map((v) => {
              return {
                value: v,
                label: v,
              };
            })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-4">
        <h1 className="font-montserrat text-2xl text-black dark:text-white font-bold">
          Preview
        </h1>
        <Card variant={formState.variant} hover={false}>
          <div className="flex flex-col gap-3">
            <h2 className="font-montserrat text-xl font-bold text-black dark:text-white">
              {formState.sectionName || "Section Name"}
            </h2>
            <p className="font-montserrat text-sm text-slate-600 dark:text-slate-300">
              {formState.description ? (
                <Markdown>{formState.description}</Markdown>
              ) : (
                "Add a description to see it here..."
              )}
            </p>
            {formState.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {formState.tags.map((tag) => (
                  <Badge key={tag} variant="primary" uppercase={false}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Modal>
  );
};
