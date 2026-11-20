import { useState } from 'react';
import { ChevronRight, Eye } from 'lucide-react';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { RoleCardContent } from './RoleCard';
import type { Player } from '../../types/game';
import roleCardStyles from './RoleCard.module.css';
import styles from './RoleReview.module.css';

interface RoleReviewModalProps {
  open: boolean;
  players: Player[];
  secretWord: string;
  category: string;
  showCategoryToSpies: boolean;
  onClose: () => void;
}

/** Lets a specific player privately reopen their card during the discussion. */
export function RoleReviewModal({
  open,
  players,
  secretWord,
  category,
  showCategoryToSpies,
  onClose,
}: RoleReviewModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const selectedPlayer =
    selectedPlayerId === null
      ? null
      : players.find((player) => player.id === selectedPlayerId) ?? null;

  const handleClose = () => {
    setSelectedPlayerId(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={selectedPlayer ? `${selectedPlayer.name}'s Card` : "Who's Checking?"}
      actions={
        selectedPlayer ? (
          <Button
            variant="primary"
            fullWidth
            onClick={() => setSelectedPlayerId(null)}
          >
            Hide Card
          </Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={handleClose}>
            Done
          </Button>
        )
      }
    >
      {selectedPlayer ? (
        <div className={styles.revealArea}>
          <div
            className={`${roleCardStyles.card} ${roleCardStyles.cardRevealed} ${styles.peekCard}`}
          >
            <RoleCardContent
              player={selectedPlayer}
              secretWord={secretWord}
              category={category}
              showCategory={!selectedPlayer.isSpy || showCategoryToSpies}
            />
          </div>

          <p className={styles.privacyHint}>
            <Eye size={14} />
            Only you should look at the screen
          </p>
        </div>
      ) : (
        <>
          <p className={styles.intro}>
            Pass the device to the player checking their card. Only tap your own
            name — and look away while others check. The timer is paused while
            you look.
          </p>
          <div className={styles.playerList}>
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                className={styles.playerButton}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <span>{player.name}</span>
                <ChevronRight size={18} className={styles.chevron} />
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
