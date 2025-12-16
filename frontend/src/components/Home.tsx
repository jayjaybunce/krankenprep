import { useTeam, useUser } from "../hooks";
import { useState, type FC } from "react";
import { useSession } from "@descope/react-sdk";
import Login from "./Login";
import Layout from "./Layout";
import { OrderableContainer } from "./DnD/OrderableContainer";
import type { Boss } from "../types/api/expansion";
import { BubbleRevealImage } from "./BubbleRevealImage";
import { ParallaxDepthImage } from "./ParallaxDepthImage";
import { MeshGradientImage } from "./MeshGradientImage";
import { PixelGlitchImage } from "./PixelGlitchImage";
import Button from "./Button";
import {
  Edit,
  Library,
  PlusIcon,
  SaveIcon,
  XIcon,
  FileText,
} from "lucide-react";
import { Card } from "./Card";
import { type AddSectionForm, AddSectionModal } from "./modals/AddSectionModal";
import Markdown from "react-markdown";
import Badge from "./Badge";
import SkeletonExamples from "./SkeletonExamples";
import { AddNoteModal } from "./modals/AddNoteModal";

export const Home: FC = () => {
  const user = useUser();
  const { boss } = useTeam();
  const { isAuthenticated, isSessionLoading } = useSession();

  if (!isAuthenticated && !isSessionLoading) {
    return <Login />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-20">
      <div className="h-full w-full flex flex-col gap-5">
        {/* Orderable component here */}
        {boss ? <BossDisplay {...boss} /> : <NoSelectedBossDisplay />}
        {/* <OrderableContainer items={phases} setItems={setPhases} /> */}
      </div>
    </div>
  );
};

type BossProps = {} & Boss;

const BossDisplay: FC<BossProps> = ({ name, splash_img_url }) => {
  const { team, boss, isEditing, setIsEditing } = useTeam();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [sections, setSections] = useState<AddSectionForm[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<AddSectionForm | null>(
    null,
  );

  const isUserAdmin = team?.name == "owner";
  const handleSave = () => {};

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/3 h-full flex flex-col gap-2">
        <ParallaxDepthImage
          imageUrl={splash_img_url}
          className="w-full h-56 rounded-lg"
          title={
            <h1 className="font-montserrat text-5xl font-bold dark:text-white text-black bg-blend-color-burn">
              {name}
            </h1>
          }
          intensity={50}
          layers={5}
          backgroundPosition="center 10%"
        />
        {isUserAdmin && (
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 px-3 py-2 rounded-lg shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
              <h2 className="font-montserrat text-slate-300 text-xs font-semibold uppercase tracking-wide">
                Admin
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant={editMode ? "danger" : "secondary"}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    Cancel <XIcon className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Edit <Edit className="w-3 h-3" />
                  </>
                )}
              </Button>
              {editMode && (
                <>
                  <Button variant="primary" size="xs" onClick={handleSave}>
                    Save <SaveIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsAddingSection(true)}
                  >
                    Add Section <PlusIcon className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-2 items-center pl-3">
            <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h1 className="font-montserrat text-black dark:text-white text-4xl">
              Sections
            </h1>
          </div>
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-2xl rounded-full" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full p-6">
                  <Library className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <h3 className="font-montserrat text-2xl font-bold text-black dark:text-white mb-2">
                No Sections Yet
              </h3>
              <p className="font-montserrat text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
                {editMode
                  ? "Click the 'Add Section' button above to create your first section and start organizing your boss strategy."
                  : "Enable edit mode to start creating sections and building your strategy guide."}
              </p>
              {!editMode && isUserAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="mt-2"
                >
                  Start Editing <Edit className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ) : null}
          {sections.map((section) => {
            const isSelected = selectedSection === section;
            return (
              <Card
                variant={section.variant}
                isActive={isSelected}
                onClick={() => {
                  setSelectedSection(section);
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="font-montserrat text-xl font-bold text-black dark:text-white">
                      {section.sectionName || "Section Name"}
                    </h2>
                    {isSelected && (
                      <Badge variant="success" uppercase={true}>
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="font-montserrat text-sm text-slate-600 dark:text-slate-300">
                    {section.description
                      ? section.description
                      : "Add a description to see it here..."}
                  </p>
                  {section.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {section.tags.map((tag) => (
                        <Badge key={tag} variant="primary" uppercase={false}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <div className="w-px bg-slate-300 dark:bg-slate-700 mx-4" />
      <div className="w-2/3 flex flex-col h-full">
        <div className="flex flex-col gap-2 pl-3 mb-5">
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex flex-row gap-2 items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <h1 className="font-montserrat text-black dark:text-white text-4xl">
                Notes
              </h1>
            </div>
            {selectedSection && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddingNote(true)}
              >
                Add Note <PlusIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
          {selectedSection && (
            <p className="font-montserrat text-sm text-slate-500 dark:text-slate-400 ml-3">
              {selectedSection.sectionName}
            </p>
          )}
        </div>
        {!selectedSection ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 blur-2xl rounded-full" />
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full p-6">
                <FileText className="w-12 h-12 text-orange-400" />
              </div>
            </div>
            <h3 className="font-montserrat text-2xl font-bold text-black dark:text-white mb-2">
              No Section Selected
            </h3>
            <p className="font-montserrat text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
              Select a section from the left to view and edit its notes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {selectedSection.notes ? (
              <div className="bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-lg p-5 shadow-sm">
                <div className="font-montserrat text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{selectedSection.notes}</Markdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
                <p className="font-montserrat text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
                  No notes added yet. Click the button above to add your first
                  note.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                >
                  Add Your First Note <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <AddSectionModal
        isOpen={isAddingSection}
        onClose={() => setIsAddingSection(false)}
        title={`${boss?.name} for ${team?.team?.name}`}
        onSave={(form) => {
          const newSections = [...sections];
          newSections.push(form);
          setSections(newSections);
          setIsAddingSection(false);
        }}
      />
      <AddNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        title={`${selectedSection?.sectionName}`}
        onSave={() => {}}
      />
    </div>
  );
};

const NoSelectedBossDisplay: FC = () => {
  return (
    <div>
      <h1 className="dark:text-white text-black">
        No boss selected, select one in the sidebar to start
      </h1>
    </div>
  );
};
