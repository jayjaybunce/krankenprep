import type { FC, ReactNode } from "react";

// Header Component
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const Header: FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className={`p-5 border-gray-200 dark:border-neutral-950 border-b`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className={`text-lg font-bold text-gray-900 dark:text-white`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-xs text-gray-500 dark:text-neutral-500`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
};

export default Header;
