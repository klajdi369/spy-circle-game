import { Play, BookOpen, HelpCircle, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

export type NavView = 'play' | 'library' | 'help' | 'settings';

interface BottomNavProps {
  active: NavView;
  onNavigate: (view: NavView) => void;
}

const TABS: { id: NavView; label: string; icon: typeof Play }[] = [
  { id: 'play', label: 'Play', icon: Play },
  { id: 'library', label: 'Words', icon: BookOpen },
  { id: 'help', label: 'How to Play', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`${styles.tab} ${active === id ? styles.active : ''}`}
          onClick={() => onNavigate(id)}
          aria-label={label}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon className={styles.icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
