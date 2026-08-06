import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import styles from './HandoffScreen.module.css';

export function HandoffScreen() {
  const { state, dispatch } = useGame();
  const player = state.players[state.currentPlayerIndex];
  const progress = ((state.currentPlayerIndex) / state.players.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <EyeOff size={48} />
      </div>

      <div className={styles.progress}>
        Player {state.currentPlayerIndex + 1} of {state.players.length}
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <h2 className={styles.playerName}>{player.name}</h2>
      <p className={styles.instruction}>Pass the device to this player</p>
      <p className={styles.warning}>
        <Eye size={16} />
        Other players: look away from the screen
      </p>

      <Button
        variant="primary"
        size="large"
        onClick={() => dispatch({ type: 'SHOW_HANDOFF' })}
      >
        I&apos;m Ready
      </Button>
    </div>
  );
}
