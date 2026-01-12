import { type FC } from "react";
import { useSession } from "@descope/react-sdk";
import { Card } from "../Card";
import Button from "../Button";
import { useRecentlyViewedPlans, useTheme, useUser } from "../../hooks";
import {
  Calendar,
  BookOpen,
  Users,
  Target,
  Bell,
  Plus,
  ArrowRight,
  MapPin,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRelativeTime } from "../../utils/timeUtils";

const Home: FC = () => {
  const { isAuthenticated, isSessionLoading } = useSession();

  if (isSessionLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />;
};

const UnauthenticatedHome: FC = () => {
  const { colorMode } = useTheme();

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="font-montserrat text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              KRANKENPREP
            </h1>
            <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">
              Master Your Raid Strategy
            </p>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            The ultimate tool for World of Warcraft raid teams. Plan encounters,
            coordinate strategies, and prepare your team for victory.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="elevated" hover={true}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Visual Planning
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Draw strategies directly on boss arena maps. Add shapes, icons,
                and notes to create detailed visual guides for your team.
              </p>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  Drag-and-drop encounter icons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  Drawing tools for positioning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  Multi-slide presentations
                </li>
              </ul>
            </div>
          </Card>

          <Card variant="elevated" hover={true}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Strategy Notes
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Build comprehensive boss guides with organized sections,
                markdown support, and team collaboration features.
              </p>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  Organized phase sections
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  Rich markdown formatting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  Collaborative editing
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4">
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Ready to take your raid team to the next level?
          </p>
          <div className="flex gap-4 justify-center">
            <p className="text-slate-500 dark:text-slate-400">
              Sign in with the sidebar to get started
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-slate-800/50 rounded-xl">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold dark:text-white text-black">
              Team Collaboration
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create teams and work together on strategies
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-slate-800/50 rounded-xl">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold dark:text-white text-black">
              Boss Library
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pre-loaded maps and icons for current raids
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-slate-800/50 rounded-xl">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold dark:text-white text-black">
              Always Updated
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay current with the latest raid content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedHome: FC = () => {
  const { colorMode } = useTheme();
  const { user } = useUser();
  const plans = useRecentlyViewedPlans(user);

  // Mock data for raid plans - replace with actual data from your API
  const recentPlans = [
    {
      id: 1,
      name: "Chimaerus - Opening Pull",
      boss: "Chimaerus",
      raid: "Dreamrift Bastion",
      slides: 3,
      lastEdited: "2 hours ago",
    },
    {
      id: 2,
      name: "Vexie - Phase 2 Positioning",
      boss: "Vexie & the Geargrinders",
      raid: "Dreamrift Bastion",
      slides: 5,
      lastEdited: "1 day ago",
    },
    {
      id: 3,
      name: "Terminus - Full Strategy",
      boss: "Terminus",
      raid: "Manaforge Omega",
      slides: 8,
      lastEdited: "3 days ago",
    },
  ];


  return (
    <div className="w-full min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="font-montserrat text-4xl font-bold dark:text-white text-black">
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your raid team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/plans">
            <Card variant="gradient" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-montserrat text-xl font-bold text-white">
                      Create Raid Plan
                    </h3>
                    <p className="text-white/80 text-sm">
                      Design visual strategies for encounters
                    </p>
                  </div>
                </div>
                <Plus className="w-6 h-6 text-white" />
              </div>
            </Card>
          </Link>

          <Link to="/prep">
            <Card variant="bordered" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      colorMode === "dark" ? "bg-cyan-500/20" : "bg-cyan-500/10"
                    }`}
                  >
                    <BookOpen
                      className={`w-6 h-6 ${
                        colorMode === "dark" ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-montserrat text-xl font-bold ${
                        colorMode === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      View Strategy Notes
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Review and edit boss strategies
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className={`w-6 h-6 ${
                    colorMode === "dark" ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
              </div>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Raid Plans - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
                <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                  Recent Raid Plans
                </h2>
              </div>
              <Link to="/plans">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2 flex flex-col gap-2">
              {plans?.plans?.reverse()?.map((plan) => (
                <Link to={`${plan.sequence}/${plan.share_id}`}>
                  <Card key={plan.id} variant="elevated" hover={true}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <h3 className="font-montserrat font-bold dark:text-white text-black">
                            {plan.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {plan.boss}
                          </span>
                          <span>•</span>
                          <span>{plan.raid}</span>
                          <span>•</span>
                          <span>{plan.tabCount} slides</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(plan.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}

              {recentPlans.length === 0 && (
                <Card variant="outlined" hover={false}>
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-montserrat text-lg font-semibold dark:text-white text-black mb-2">
                      No Raid Plans Yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Create your first visual strategy to get started
                    </p>
                    <Link to="/plan/midnight">
                      <Button variant="primary" size="sm">
                        Create Your First Plan
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Notifications - Takes 1 column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
              <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
                Notifications
              </h2>
            </div>

            <Card variant="outlined" hover={false}>
              <div className="text-center py-6">
                <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Coming soon
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <Card variant="bordered" hover={false}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-montserrat text-lg font-bold dark:text-white text-black">
                Need Help Getting Started?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select a boss from the sidebar to start creating strategies, or
                jump straight into the visual planner to design encounter maps.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/prep">
                <Button variant="secondary" size="sm">
                  <BookOpen className="w-4 h-4" />
                  Go to Prep
                </Button>
              </Link>
              <Link to="/plan/midnight">
                <Button variant="primary" size="sm">
                  <MapPin className="w-4 h-4" />
                  Go to Planner
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
