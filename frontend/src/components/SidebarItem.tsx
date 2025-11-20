// Sidebar Item Component
interface SidebarItemProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  children,
  isActive,
  onClick,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-md mb-1 flex items-center gap-3 transition ${
        isActive
          ? ` bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border-l-2 border-cyan-500`
          : `text-gray-500 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-900`
      }`}
    >
      {icon && (
        <div
          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-amber-500" : "bg-neutral-700"}`}
        ></div>
      )}
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};

export default SidebarItem;
