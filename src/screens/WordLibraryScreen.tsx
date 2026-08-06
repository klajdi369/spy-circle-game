import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  X,
  GripVertical,
  FolderOpen,
} from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { Toggle } from '../components/shared/Toggle';
import { useWordLibrary } from '../hooks/useWordLibrary';
import styles from './WordLibraryScreen.module.css';

export function WordLibraryScreen() {
  const {
    library,
    addCategory,
    renameCategory,
    toggleCategory,
    deleteCategory,
    addWord,
    addWordsBulk,
    editWord,
    deleteWord,
    removeDuplicates,
    restoreCategory,
    restoreAll,
    exportLib,
    importLib,
  } = useWordLibrary();

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newWordInputs, setNewWordInputs] = useState<Record<string, string>>({});
  const [bulkInputs, setBulkInputs] = useState<Record<string, string>>({});
  const [showBulk, setShowBulk] = useState<Set<string>>(new Set());

  // Modals
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catError, setCatError] = useState('');

  const [renameModal, setRenameModal] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteWordConfirm, setDeleteWordConfirm] = useState<{ catId: string; index: number; word: string } | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  const [restoreAllConfirm, setRestoreAllConfirm] = useState(false);
  const [editWordState, setEditWordState] = useState<{ catId: string; index: number; word: string } | null>(null);
  const [editWordValue, setEditWordValue] = useState('');
  const [editWordError, setEditWordError] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return library.categories;
    return library.categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.words.some((w) => w.toLowerCase().includes(q)),
    );
  }, [library.categories, search]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddCategory = useCallback(() => {
    const result = addCategory(newCategoryName);
    if (!result.success) {
      setCatError(result.error ?? 'Failed to add category');
    } else {
      setNewCategoryName('');
      setCatError('');
      setAddCategoryModal(false);
      showFeedback('success', 'Category added.');
    }
  }, [newCategoryName, addCategory, showFeedback]);

  const handleRename = useCallback(() => {
    if (!renameModal) return;
    const result = renameCategory(renameModal.id, renameValue);
    if (!result.success) {
      setRenameError(result.error ?? 'Failed to rename');
    } else {
      setRenameModal(null);
      setRenameValue('');
      setRenameError('');
      showFeedback('success', 'Category renamed.');
    }
  }, [renameModal, renameValue, renameCategory, showFeedback]);

  const handleAddWord = useCallback((catId: string) => {
    const word = newWordInputs[catId] ?? '';
    const result = addWord(catId, word);
    if (!result.success) {
      showFeedback('error', result.error ?? 'Failed to add word');
    } else {
      setNewWordInputs((prev) => ({ ...prev, [catId]: '' }));
      showFeedback('success', 'Word added.');
    }
  }, [newWordInputs, addWord, showFeedback]);

  const handleBulkAdd = useCallback((catId: string) => {
    const text = bulkInputs[catId] ?? '';
    const { added, skipped } = addWordsBulk(catId, text);
    if (added > 0 || skipped > 0) {
      setBulkInputs((prev) => ({ ...prev, [catId]: '' }));
      showFeedback('success', `${added} words added, ${skipped} skipped.`);
    }
  }, [bulkInputs, addWordsBulk, showFeedback]);

  const handleEditWord = useCallback(() => {
    if (!editWordState) return;
    const result = editWord(editWordState.catId, editWordState.index, editWordValue);
    if (!result.success) {
      setEditWordError(result.error ?? 'Failed to edit');
    } else {
      setEditWordState(null);
      setEditWordValue('');
      setEditWordError('');
      showFeedback('success', 'Word updated.');
    }
  }, [editWordState, editWordValue, editWord, showFeedback]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const json = reader.result as string;
        const result = importLib(json);
        if (!result.success) {
          showFeedback('error', result.error ?? 'Import failed');
        } else {
          showFeedback('success', 'Library imported successfully.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importLib, showFeedback]);

  const handleExport = useCallback(() => {
    const json = exportLib();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spy-circle-words.json';
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'Library exported.');
  }, [exportLib, showFeedback]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Word Library</h1>
        <p className={styles.subtitle}>
          {library.categories.length} categories,{' '}
          {library.categories.reduce((sum, c) => sum + c.words.length, 0)} words
        </p>
      </div>

      {feedback && (
        <div className={feedback.type === 'success' ? styles.success : styles.error} style={{ marginBottom: 'var(--space-md)' }}>
          {feedback.message}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" size="small" onClick={() => setAddCategoryModal(true)}>
          <Plus size={16} /> Add Category
        </Button>
        <Button variant="secondary" size="small" onClick={handleImport}>
          <Upload size={16} /> Import
        </Button>
        <Button variant="secondary" size="small" onClick={handleExport}>
          <Download size={16} /> Export
        </Button>
        <Button variant="ghost" size="small" onClick={() => setRestoreAllConfirm(true)}>
          <RotateCcw size={16} /> Restore All
        </Button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}
        />
        <input
          className={styles.search}
          type="text"
          placeholder="Search categories and words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
          aria-label="Search categories and words"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className={styles.emptyMessage}>
          <FolderOpen size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>No categories found.</p>
        </div>
      ) : (
        <div className={styles.categoryList}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className={`${styles.categoryItem} ${!cat.enabled ? styles.disabled : ''}`}>
              <div className={styles.categoryHeader}>
                <button
                  className={styles.categoryInfo}
                  onClick={() => toggleExpand(cat.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                  aria-label={`${expanded.has(cat.id) ? 'Collapse' : 'Expand'} ${cat.name}`}
                >
                  {expanded.has(cat.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryMeta}>
                    {cat.words.length} word{cat.words.length !== 1 ? 's' : ''}
                    {cat.isPredefined ? ' · default' : ' · custom'}
                  </span>
                </button>
                <div className={styles.categoryActions}>
                  <Toggle
                    label=""
                    checked={cat.enabled}
                    onChange={() => toggleCategory(cat.id)}
                    ariaLabel={`${cat.enabled ? 'Disable' : 'Enable'} category ${cat.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setRenameModal({ id: cat.id, name: cat.name });
                      setRenameValue(cat.name);
                      setRenameError('');
                    }}
                    aria-label={`Rename ${cat.name}`}
                  >
                    <Pencil size={14} />
                  </Button>
                  {!cat.isPredefined && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setDeleteConfirm(cat.id)}
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>

              {expanded.has(cat.id) && (
                <div className={styles.wordList}>
                  {cat.words.map((word, i) => (
                    <span key={i} className={styles.wordChip}>
                      {word}
                      <button
                        onClick={() => {
                          setEditWordState({ catId: cat.id, index: i, word });
                          setEditWordValue(word);
                          setEditWordError('');
                        }}
                        aria-label={`Edit ${word}`}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => setDeleteWordConfirm({ catId: cat.id, index: i, word })}
                        aria-label={`Delete ${word}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}

                  {/* Add word form */}
                  <div className={styles.addWordForm}>
                    <input
                      className={styles.addWordInput}
                      type="text"
                      placeholder="Add a word..."
                      value={newWordInputs[cat.id] ?? ''}
                      onChange={(e) =>
                        setNewWordInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddWord(cat.id);
                      }}
                      aria-label={`New word for ${cat.name}`}
                    />
                    <Button variant="primary" size="small" onClick={() => handleAddWord(cat.id)}>
                      Add
                    </Button>
                  </div>

                  {/* Bulk add toggle */}
                  <button
                    onClick={() => {
                      setShowBulk((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat.id)) next.delete(cat.id);
                        else next.add(cat.id);
                        return next;
                      });
                    }}
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: 4,
                    }}
                  >
                    {showBulk.has(cat.id) ? 'Hide bulk import' : 'Bulk import...'}
                  </button>

                  {showBulk.has(cat.id) && (
                    <div className={styles.bulkArea}>
                      <textarea
                        className={styles.bulkTextarea}
                        placeholder="Paste one word per line..."
                        value={bulkInputs[cat.id] ?? ''}
                        onChange={(e) =>
                          setBulkInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                        }
                        aria-label={`Bulk import words for ${cat.name}`}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Button variant="primary" size="small" onClick={() => handleBulkAdd(cat.id)}>
                          Import Words
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => {
                            removeDuplicates(cat.id);
                            showFeedback('success', 'Duplicates removed.');
                          }}
                        >
                          <GripVertical size={14} /> Remove Duplicates
                        </Button>
                      </div>
                    </div>
                  )}

                  {cat.isPredefined && (
                    <div style={{ marginTop: 8 }}>
                      <Button variant="ghost" size="small" onClick={() => setRestoreConfirm(cat.id)}>
                        <RotateCcw size={14} /> Restore Defaults
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        open={addCategoryModal}
        onClose={() => {
          setAddCategoryModal(false);
          setNewCategoryName('');
          setCatError('');
        }}
        title="Add Category"
        actions={
          <>
            <Button variant="ghost" onClick={() => setAddCategoryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Add
            </Button>
          </>
        }
      >
        <label className={styles.fieldLabel} htmlFor="new-category-name">Category Name</label>
        <input
          id="new-category-name"
          className={styles.modalInput}
          type="text"
          value={newCategoryName}
          onChange={(e) => {
            setNewCategoryName(e.target.value);
            setCatError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCategory();
          }}
          placeholder="e.g., Movies"
          autoFocus
        />
        {catError && <p className={styles.inlineError}>{catError}</p>}
      </Modal>

      {/* Rename Modal */}
      <Modal
        open={renameModal !== null}
        onClose={() => setRenameModal(null)}
        title="Rename Category"
        actions={
          <>
            <Button variant="ghost" onClick={() => setRenameModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRename}>
              Save
            </Button>
          </>
        }
      >
        <label className={styles.fieldLabel} htmlFor="rename-category-name">New Name</label>
        <input
          id="rename-category-name"
          className={styles.modalInput}
          type="text"
          value={renameValue}
          onChange={(e) => {
            setRenameValue(e.target.value);
            setRenameError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
          }}
          autoFocus
        />
        {renameError && <p className={styles.inlineError}>{renameError}</p>}
      </Modal>

      {/* Edit Word Modal */}
      <Modal
        open={editWordState !== null}
        onClose={() => setEditWordState(null)}
        title="Edit Word"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditWordState(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditWord}>
              Save
            </Button>
          </>
        }
      >
        <label className={styles.fieldLabel} htmlFor="edit-word-input">Word</label>
        <input
          id="edit-word-input"
          className={styles.modalInput}
          type="text"
          value={editWordValue}
          onChange={(e) => {
            setEditWordValue(e.target.value);
            setEditWordError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEditWord();
          }}
          autoFocus
        />
        {editWordError && <p className={styles.inlineError}>{editWordError}</p>}
      </Modal>

      {/* Delete Category Confirm */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) deleteCategory(deleteConfirm);
                setDeleteConfirm(null);
                showFeedback('success', 'Category deleted.');
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>This will permanently delete this category and all its words. This cannot be undone.</p>
      </Modal>

      {/* Delete Word Confirm */}
      <Modal
        open={deleteWordConfirm !== null}
        onClose={() => setDeleteWordConfirm(null)}
        title="Delete Word?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteWordConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteWordConfirm) {
                  deleteWord(deleteWordConfirm.catId, deleteWordConfirm.index);
                }
                setDeleteWordConfirm(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete &ldquo;{deleteWordConfirm?.word}&rdquo;? This cannot be undone.
        </p>
      </Modal>

      {/* Restore Category Defaults */}
      <Modal
        open={restoreConfirm !== null}
        onClose={() => setRestoreConfirm(null)}
        title="Restore Defaults?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setRestoreConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (restoreConfirm) restoreCategory(restoreConfirm);
                setRestoreConfirm(null);
                showFeedback('success', 'Category restored to defaults.');
              }}
            >
              Restore
            </Button>
          </>
        }
      >
        <p>This will replace all words in this category with the original defaults. Custom words will be lost.</p>
      </Modal>

      {/* Restore All Confirm */}
      <Modal
        open={restoreAllConfirm}
        onClose={() => setRestoreAllConfirm(false)}
        title="Restore All Defaults?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setRestoreAllConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                restoreAll();
                setRestoreAllConfirm(false);
                showFeedback('success', 'All categories restored to defaults.');
              }}
            >
              Restore All
            </Button>
          </>
        }
      >
        <p>
          This will reset all categories to their original words. Custom categories will be removed
          and custom words will be lost. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
