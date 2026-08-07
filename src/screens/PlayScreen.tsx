import { useState, useMemo, useCallback } from 'react';
import { Eye, Users, Clock, ChevronRight } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useWordLibrary } from '../hooks/useWordLibrary';
import { useSettings } from '../hooks/useSettings';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { Stepper } from '../components/shared/Stepper';
import { Toggle } from '../components/shared/Toggle';
import { validateSpyCount, clampSpyCount, hasUsableWords } from '../logic/validation';
import { generateDefaultNames, preserveNames } from '../logic/playerNames';
import { pickRandom, pickRandomIndices } from '../logic/random';
import type { GameConfig, Player } from '../types/game';
import styles from './PlayScreen.module.css';

const TIMER_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '7 min', value: 420 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: 'None', value: null as number | null },
];

export function PlayScreen() {
  const { state, startGame } = useGame();
  const { library } = useWordLibrary();
  const { settings, updateSetting } = useSettings();

  const [playerCount, setPlayerCount] = useState(state.config.playerCount);
  const [spyCount, setSpyCount] = useState(state.config.spyCount);
  const [timerDuration, setTimerDuration] = useState<number | null>(
    settings.lastTimerDuration ?? state.config.timerDuration,
  );
  const [usePlayerNames, setUsePlayerNames] = useState(state.config.usePlayerNames);
  const [namesModalOpen, setNamesModalOpen] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    state.config.playerNames.length > 0
      ? preserveNames(state.config.playerNames, playerCount)
      : generateDefaultNames(playerCount),
  );
  const [error, setError] = useState<string | null>(null);

  const enabledCategories = useMemo(
    () => library.categories.filter((c) => c.enabled && c.words.length > 0),
    [library],
  );

  const spyValidation = useMemo(
    () => validateSpyCount(playerCount, spyCount),
    [playerCount, spyCount],
  );

  const canStart = useMemo(
    () => hasUsableWords(enabledCategories),
    [enabledCategories],
  );

  // One-line summary of the current name setup, shown on the row that opens the editor.
  const namesSummary = useMemo(() => {
    if (!usePlayerNames) return 'Default names';
    const trimmed = playerNames.map((n) => n.trim()).filter(Boolean);
    if (trimmed.length === 0) return 'No custom names yet';
    const shown = trimmed.slice(0, 2).join(', ');
    const rest = trimmed.length - 2;
    return rest > 0 ? `${shown}, +${rest} more` : shown;
  }, [usePlayerNames, playerNames]);

  const handlePlayerCountChange = useCallback(
    (newCount: number) => {
      setPlayerCount(newCount);
      const corrected = clampSpyCount(newCount, spyCount);
      if (corrected !== spyCount) setSpyCount(corrected);
      setPlayerNames((prev) => preserveNames(prev, newCount));
    },
    [spyCount],
  );

  const handleSpyCountChange = useCallback(
    (newCount: number) => {
      const { corrected } = validateSpyCount(playerCount, newCount);
      setSpyCount(corrected);
    },
    [playerCount],
  );

  const handleTimerChange = useCallback((value: number | null) => {
    setTimerDuration(value);
    updateSetting('lastTimerDuration', value);
  }, [updateSetting]);

  const handleStartGame = useCallback(() => {
    setError(null);

    // Select category
    if (enabledCategories.length === 0) {
      setError('No categories with words available. Enable at least one category with words in the Word Library.');
      return;
    }
    const selectedCategory = pickRandom(enabledCategories);
    if (!selectedCategory) {
      setError('Could not select a category. Add or enable categories in the Word Library.');
      return;
    }

    // Select word
    const secretWord = pickRandom(selectedCategory.words);
    if (!secretWord) {
      setError('Could not select a word. Add more words to the selected category.');
      return;
    }

    // Select spies
    const spyIndices = pickRandomIndices(playerCount, spyCount);

    // Get names
    const names = usePlayerNames
      ? playerNames.map((n, i) => n.trim() || `Player ${i + 1}`)
      : generateDefaultNames(playerCount);

    // Create players
    const players: Player[] = names.map((name, i) => ({
      id: i,
      name,
      isSpy: spyIndices.includes(i),
    }));

    const config: GameConfig = {
      playerCount,
      spyCount,
      timerDuration,
      categoryId: selectedCategory.id,
      usePlayerNames,
      playerNames: names,
    };

    startGame(config, secretWord, selectedCategory.name, players);
  }, [
    playerCount,
    spyCount,
    timerDuration,
    usePlayerNames,
    playerNames,
    enabledCategories,
    startGame,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Eye size={32} />
        </div>
        <h1 className={styles.title}>Spy Circle</h1>
        <p className={styles.subtitle}>A game of secrets and deduction</p>
      </div>

      {error && (
        <div className={styles.errorBox} role="alert">
          <p>{error}</p>
        </div>
      )}

      <Card className={styles.cardArea}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} />
            Players
          </div>
          <div className={styles.row}>
            <Stepper
              label="Players"
              value={playerCount}
              min={3}
              max={20}
              onChange={handlePlayerCountChange}
            />
            <Stepper
              label="Spies"
              value={spyCount}
              min={1}
              max={Math.max(1, playerCount - 2)}
              onChange={handleSpyCountChange}
            />
          </div>
          {!spyValidation.valid && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginTop: 'var(--space-sm)' }}>
              {spyValidation.message}
            </p>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
            Discussion Timer
          </div>
          <div className={styles.timerGroup}>
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                className={`${styles.timerButton} ${timerDuration === opt.value ? styles.timerButtonActive : ''}`}
                onClick={() => handleTimerChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <button
            className={styles.namesRow}
            type="button"
            onClick={() => setNamesModalOpen(true)}
            aria-label={`Player names: ${namesSummary}`}
          >
            <span className={styles.namesRowText}>
              <span className={styles.namesRowLabel}>Player Names</span>
              <span className={styles.namesRowValue}>{namesSummary}</span>
            </span>
            <ChevronRight size={18} className={styles.namesRowChevron} />
          </button>
        </div>
      </Card>

      <div className={styles.startArea}>
        {!canStart && (
          <p className={styles.startWarning}>
            No usable words available. Go to the Word Library to add or enable categories.
          </p>
        )}
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={handleStartGame}
          disabled={!canStart}
        >
          Start Game
        </Button>
      </div>

      <Modal
        open={namesModalOpen}
        onClose={() => setNamesModalOpen(false)}
        title="Player Names"
        actions={
          <Button variant="primary" fullWidth onClick={() => setNamesModalOpen(false)}>
            Done
          </Button>
        }
      >
        <Toggle
          label="Use custom names"
          checked={usePlayerNames}
          onChange={setUsePlayerNames}
        />
        {usePlayerNames ? (
          <div className={styles.nameFields}>
            {playerNames.map((name, i) => (
              <div key={i} className={styles.nameField}>
                <span className={styles.nameNumber}>{i + 1}</span>
                <input
                  className={styles.nameInput}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                  placeholder={`Player ${i + 1}`}
                  aria-label={`Player ${i + 1} name`}
                  maxLength={30}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.namesHint}>
            Default names (Player 1, Player 2, &hellip;) will be used.
          </p>
        )}
      </Modal>
    </div>
  );
}
