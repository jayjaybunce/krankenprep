import { useTeam, useTheme } from "../../hooks";
import { useEffect, useState, type FC } from "react";
import { useSession, Descope } from "@descope/react-sdk";
import type { Boss } from "../../types/api/expansion";
import { ParallaxDepthImage } from "../ParallaxDepthImage";
import Button from "../Button";
import {
  Edit,
  Library,
  PlusIcon,
  SaveIcon,
  XIcon,
  FileText,
  BookOpen,
  Lightbulb,
  Users,
  Target,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Card } from "../Card";
import { AddSectionModal } from "../modals/AddSectionModal";
import Badge from "../Badge";
import { AddNoteModal } from "../modals/AddNoteModal";
import { MarkdownGuideModal } from "../modals/MarkdownGuideModal";
import { Link } from "react-router-dom";
import { useCreateNote, useCreateSection } from "../../api/mutationHooks";
import {
  useGetRaidplanById,
  useTeamAndBossSections,
} from "../../api/queryHooks";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { BossSelection } from "../BossSelection";
import PlanViewer from "./PlanViewer";

export const Prep: FC = () => {
  const { boss } = useTeam();
  const { isAuthenticated, isSessionLoading } = useSession();

  if (isSessionLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UnauthenticatedPrepView />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center px-20 py-5">
      <div className="h-full w-full flex flex-col gap-5">
        <BossSelection />
        {boss ? <BossDisplay {...boss} /> : <NoSelectedBossDisplay />}
      </div>
    </div>
  );
};

type BossProps = {} & Boss;

const BossDisplay: FC<BossProps> = ({ name, splash_img_url }) => {
  const { team, boss } = useTeam();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [selectedPlanId] = useState("");

  const { data: planData } = useGetRaidplanById(
    selectedPlanId,
    !!selectedPlanId,
  );

  const isUserAdmin = team?.name == "owner";
  const handleSave = () => {};
  const { mutate: createSection } = useCreateSection(
    boss?.id?.toString(),
    team?.id?.toString(),
  );

  const { mutate: createNote } = useCreateNote(
    boss?.id?.toString(),
    team?.id?.toString(),
  );

  const { data } = useTeamAndBossSections(
    boss?.id?.toString(),
    team?.team_id?.toString(),
  );

  const sections = data?.sections ?? [];

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Need to fix this its bad
  useEffect(() => {
    setSelectedSectionId(null);
  }, [boss]);

  return (
    <div className="flex flex-row justify-center">
      <div className="w-4/9 flex flex-col h-full gap-2">
        <div className="h-auto">
          {planData ? (
            <div className="w-full">
              <PlanViewer tabs={planData?.content} />
            </div>
          ) : (
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
          )}
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
          <div className="flex flex-col gap-5 h-full">
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
            <div className="flex flex-col gap-6">
              {sections.map((section) => {
                const isSelected = selectedSection?.id === section?.id;
                return (
                  <Card
                    variant={section.variant}
                    isActive={isSelected}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row justify-between items-start">
                        <h2 className="font-montserrat text-xl font-bold text-black dark:text-white">
                          {section?.name || "Section Name"}
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
                          {section.tags.split("-$-").map((tag) => (
                            <Badge
                              key={tag}
                              variant="primary"
                              uppercase={false}
                            >
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
        </div>
      </div>
      <div className="w-px bg-slate-300 dark:bg-slate-700 mx-4" />
      <div className="w-5/9 flex flex-col h-full">
        <div className="flex flex-col gap-2 pl-3 mb-5">
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex flex-row gap-2 items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <h1 className="font-montserrat text-black dark:text-white text-4xl">
                Notes
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMarkdownGuide(true)}
              >
                <HelpCircle className="w-4 h-4" /> Markdown Guide
              </Button>
              {selectedSection && isUserAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                >
                  Add Note <PlusIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {/* {selectedSection && (
            <p className="font-montserrat text-sm text-slate-500 dark:text-slate-400 ml-3">
              {selectedSection}
            </p>
          )} */}
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
            {selectedSection.notes && selectedSection.notes.length > 0 ? (
              selectedSection.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-lg p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(() => {
                          const date = new Date(note.created_at);

                          if (isNaN(date.getTime())) {
                            return "Invalid date";
                          }

                          return date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          });
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="font-montserrat text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer>{note.content}</MarkdownRenderer>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
                <p className="font-montserrat text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
                  {isUserAdmin
                    ? "No notes added yet. Click the button above to add your first note."
                    : "No notes added yet. Contact your team admin to add notes."}
                </p>
                {isUserAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddingNote(true)}
                  >
                    Add Your First Note <PlusIcon className="w-4 h-4" />
                  </Button>
                )}
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
          // const newSections = [...sections];
          // newSections.push(form);
          // setSections(newSections);
          const payload = {
            boss_id: boss?.id as number,
            team_id: team?.team_id as number,
            description: form.description,
            name: form.sectionName,
            variant: Array.isArray(form.variant)
              ? form.variant.join("-$-")
              : form.variant,
            tags: form.tags.join("-$-"),
          };
          createSection(payload);
          setIsAddingSection(false);
        }}
      />
      <AddNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        title={`${selectedSection?.name}`}
        onSave={(formState) => {
          const payload = {
            section_id: selectedSection?.id as number,
            content: formState.content,
          };
          createNote(payload);
        }}
      />
      <MarkdownGuideModal
        isOpen={showMarkdownGuide}
        onClose={() => setShowMarkdownGuide(false)}
      />
    </div>
  );
};

const UnauthenticatedPrepView: FC = () => {
  const { colorMode } = useTheme();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 mb-4">
            <BookOpen className="w-16 h-16 text-purple-400" />
          </div>
          <div className="space-y-4">
            <h1 className="font-montserrat text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              Strategy Prep
            </h1>
            <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">
              Build Comprehensive Boss Guides
            </p>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Create detailed strategy notes, organize mechanics by phase, and
            collaborate with your team to master every encounter.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="elevated" hover={true}>
            <div className="flex flex-col items-center text-center gap-4 p-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Library className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat text-xl font-bold dark:text-white text-black">
                  Organized Sections
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Break down encounters into manageable sections - phases,
                  mechanics, positioning, and more.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" hover={true}>
            <div className="flex flex-col items-center text-center gap-4 p-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat text-xl font-bold dark:text-white text-black">
                  Rich Notes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Write detailed notes with full markdown support for
                  formatting, lists, and emphasis.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" hover={true}>
            <div className="flex flex-col items-center text-center gap-4 p-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-montserrat text-xl font-bold dark:text-white text-black">
                  Team Collaboration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Work together with your raid team to build and refine
                  strategies for progression.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <Card variant="bordered" hover={false}>
          <div className="space-y-6 p-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
              <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                How It Works
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold dark:text-white text-black">
                    Select a Boss
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose a raid boss from the sidebar to start building your
                    strategy guide.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold dark:text-white text-black">
                    Create Sections
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Organize your strategy into sections like phases,
                    assignments, or cooldown rotations.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold dark:text-white text-black">
                    Add Notes
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Write detailed notes for each section with markdown
                    formatting and helpful tags.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold dark:text-white text-black">
                    Share & Collaborate
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your team can view, edit, and contribute to the strategy
                    guide together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Login Section */}
        <Card variant="gradient" hover={false}>
          <div className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="space-y-3">
              <h2 className="font-montserrat text-3xl font-bold text-white">
                Ready to Start Prepping?
              </h2>
              <p className="text-white/90 text-lg max-w-2xl">
                Sign in to create your first boss strategy guide and start
                organizing your raid team's approach to challenging encounters.
              </p>
            </div>
            <div className="w-full max-w-md">
              <Descope
                flowId="sign-up-or-in"
                theme={colorMode}
                onError={(err: any) => {
                  console.log("Error!", err);
                  alert("Error: " + err.detail.message);
                }}
              />
            </div>
          </div>
        </Card>

        {/* Quick Tip */}
        <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Lightbulb className="w-5 h-5" />
          <p className="text-sm">
            Pair strategy notes with visual raid plans for the ultimate prep
            experience
          </p>
        </div>
      </div>
    </div>
  );
};

const NoSelectedBossDisplay: FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20">
      <div className="max-w-3xl w-full space-y-8">
        <Card variant="elevated" hover={false}>
          <div className="flex flex-col items-center text-center gap-6 p-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 blur-3xl rounded-full" />
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full p-8">
                <Target className="w-16 h-16 text-purple-400" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="font-montserrat text-3xl font-bold dark:text-white text-black">
                Select a Boss to Begin
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                Choose a raid boss from the sidebar to start creating strategy
                notes and building your encounter guide.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card variant="bordered" hover={true}>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 p-2 bg-indigo-500/20 rounded-lg">
                <Library className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold dark:text-white text-black">
                  Organize by Sections
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Break down encounters into phases, mechanics, and assignments
                  for clarity.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" hover={true}>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 p-2 bg-orange-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold dark:text-white text-black">
                  Markdown Support
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Format your notes with headers, lists, bold, and italics for
                  readability.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" hover={true}>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 p-2 bg-cyan-500/20 rounded-lg">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold dark:text-white text-black">
                  Team Editing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Admins can create and edit sections while the team reviews the
                  guide.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" hover={true}>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 p-2 bg-purple-500/20 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold dark:text-white text-black">
                  Tag System
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Label sections with tags like "Tank", "Healer", or "DPS" for
                  quick reference.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="outlined" hover={false}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div className="text-center md:text-left">
              <h3 className="font-montserrat text-lg font-bold dark:text-white text-black mb-1">
                Need Visual Planning Too?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create detailed raid plans with positioning and movement guides
              </p>
            </div>
            <Link to="/plan/midnight">
              <Button variant="primary" size="sm">
                Go to Planner
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
