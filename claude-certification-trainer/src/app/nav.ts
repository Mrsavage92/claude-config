import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Zap,
  Flame,
  GraduationCap,
  FlaskConical,
  RotateCcw,
  BarChart3,
  Library,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  group: 'study' | 'practice' | 'insights';
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, group: 'study' },
  { to: '/learn', label: 'Learn', icon: BookOpen, group: 'study' },
  { to: '/labs', label: 'Labs', icon: FlaskConical, group: 'study' },
  { to: '/practice', label: 'Practice', icon: Dumbbell, group: 'practice' },
  { to: '/rapid-fire', label: 'Rapid Fire', icon: Zap, group: 'practice' },
  { to: '/flash-fire', label: 'Flash Fire', icon: Flame, group: 'practice' },
  { to: '/mock-exam', label: 'Mock Exam', icon: GraduationCap, group: 'practice' },
  { to: '/review', label: 'Review', icon: RotateCcw, group: 'practice' },
  { to: '/progress', label: 'Progress', icon: BarChart3, group: 'insights' },
  { to: '/sources', label: 'Sources', icon: Library, group: 'insights' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, group: 'insights' },
];

export const GROUP_LABELS: Record<NavItem['group'], string> = {
  study: 'Study',
  practice: 'Practice',
  insights: 'Insights',
};
