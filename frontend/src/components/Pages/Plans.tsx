import { type FC, useState, useMemo } from "react";
import { useDocumentTitle } from "../../hooks";
import { useMyRaidplans } from "../../api/queryHooks";
import { Link } from "react-router-dom";
import { Card } from "../Card";
import { Clock, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";

const raids = [
  {
    name: "Midnight",
    route: "/plan/midnight",
    imageSrc: "https://cdn.raidplan.io/wow/lorebg/windrunnerspire.jpg", // Placeholder - will be replaced
  },
  {
    name: "Manaforge",
    route: "/plan/manaforge",
    imageSrc:
      "https://wow.zamimg.com/optimized/guide-header-revamp/uploads/guide/header/f9dcd9dd54abd5152d9cd0c00478db9da96e7ac2.jpg", // Placeholder - will be replaced
  },
  {
    name: "Undermine",
    route: "/plan/undermine",
    imageSrc:
      "https://wow.zamimg.com/optimized/guide-header-revamp/uploads/guide/header/150e48b718bcad17e31dab3af7278f63e72f89af.jpg", // Placeholder - will be replaced
  },
  {
    name: "Nerub-ar Palace",
    route: "/plan/nerubarpalace",
    imageSrc:
      "https://wow.zamimg.com/optimized/guide-header-revamp/uploads/guide/header/f9dcd9dd54abd5152d9cd0c00478db9da96e7ac2.jpg", // Placeholder - will be replaced
  },
];

const Plans: FC = () => {
  useDocumentTitle("My Plans");
  const { data: raidPlans, isLoading } = useMyRaidplans();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const { paginatedPlans, totalPages } = useMemo(() => {
    if (!raidPlans) return { paginatedPlans: [], totalPages: 0 };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = raidPlans.slice(startIndex, endIndex);
    const total = Math.ceil(raidPlans.length / itemsPerPage);

    return { paginatedPlans: paginated, totalPages: total };
  }, [raidPlans, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-montserrat text-4xl font-bold dark:text-white text-black">
            Raid Plans
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Select a raid to create a new plan or view your existing plans below
          </p>
        </div>

        {/* Raid Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {raids.map((raid) => (
            <Link key={raid.name} to={raid.route}>
              <Card variant="elevated" hover={true}>
                <div className="aspect-video relative overflow-hidden rounded-lg mb-3">
                  <img
                    src={raid.imageSrc}
                    alt={raid.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-montserrat text-lg font-bold dark:text-white text-black text-center">
                  {raid.name}
                </h3>
              </Card>
            </Link>
          ))}
        </div>

        {/* My Raid Plans Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
            <h2 className="font-montserrat text-2xl font-bold dark:text-white text-black">
              My Raid Plans
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : raidPlans && raidPlans.length > 0 ? (
            <div className="space-y-4">
              <Card variant="elevated" hover={false}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold dark:text-slate-300 text-slate-700">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold dark:text-slate-300 text-slate-700">
                          Boss
                        </th>
                        <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold dark:text-slate-300 text-slate-700">
                          Raid
                        </th>
                        <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold dark:text-slate-300 text-slate-700">
                          Last Updated
                        </th>
                        <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold dark:text-slate-300 text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPlans.map((plan) => (
                        <tr
                          key={plan.id}
                          className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 dark:text-white text-black font-medium">
                            {plan.name}
                          </td>
                          <td className="py-3 px-4 dark:text-slate-300 text-slate-700">
                            {plan.boss}
                          </td>
                          <td className="py-3 px-4 dark:text-slate-300 text-slate-700">
                            {plan.raid}
                          </td>
                          <td className="py-3 px-4 dark:text-slate-400 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatDate(plan.updated_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`${plan.sequence}/${plan.share_id}`}
                                className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                                title="View plan"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`${plan.sequence}/${plan.edit_id}`}
                                className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                                title="Edit plan"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm dark:text-slate-400 text-slate-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, raidPlans.length)} of{" "}
                    {raidPlans.length} plans
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 bg-slate-200 dark:text-white text-black dark:hover:bg-slate-700 hover:bg-slate-300 disabled:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <span className="px-4 py-2 dark:text-white text-black font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 bg-slate-200 dark:text-white text-black dark:hover:bg-slate-700 hover:bg-slate-300 disabled:hover:bg-slate-800"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card variant="outlined">
              <div className="text-center py-12">
                <p className="text-lg font-medium dark:text-white text-black mb-2">
                  No Raid Plans Yet
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a raid above to create your first plan
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;
