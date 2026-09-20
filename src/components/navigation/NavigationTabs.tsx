import React from 'react';
import {
  BookOpen,
  Calendar,
  Compass,
  GitBranch,
  Layers,
  Lightbulb,
  Radio,
  Receipt as ReceiptIcon,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'life-map'
  | 'timeline'
  | 'receipts'
  | 'connections'
  | 'patterns'
  | 'chapters'
  | 'insights';

interface NavigationTabsProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  receiptsCount?: number;
  connectionsCount?: number;
  patternsCount?: number;
  chaptersCount?: number;
  clusterCount?: number;
  patternCount?: number;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  receiptsCount,
  connectionsCount,
  patternsCount,
  chaptersCount,
  clusterCount,
  patternCount,
}) => {
  const items: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Radio },
    { id: 'life-map', label: 'Life Map', icon: Compass },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'receipts', label: 'Receipts', icon: ReceiptIcon, badge: receiptsCount },
    { id: 'connections', label: 'Connections', icon: GitBranch, badge: connectionsCount ?? clusterCount },
    { id: 'patterns', label: 'Patterns', icon: Layers, badge: patternsCount ?? patternCount },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, badge: chaptersCount },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="w-full border-b border-stone-800/80 bg-stone-950/70 backdrop-blur-md sticky top-16 z-30 overflow-x-auto no-scrollbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectTab(item.id)}
                  className={`group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isActive
                      ? 'bg-stone-900 text-amber-400 font-semibold shadow-sm border border-stone-800'
                      : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                    }`}
                  />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-stone-800 text-stone-400 group-hover:bg-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
