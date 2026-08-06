import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordLibraryScreen } from '../../screens/WordLibraryScreen';

function seedLibrary() {
  localStorage.setItem(
    'spy-circle-word-library',
    JSON.stringify({
      version: 1,
      categories: [
        {
          id: 'cat1',
          name: 'Animals',
          enabled: true,
          isPredefined: true,
          originalWords: ['Dog', 'Cat'],
          words: ['Dog', 'Cat'],
        },
      ],
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  seedLibrary();
});

describe('WordLibraryScreen', () => {
  it('renders categories with word counts', () => {
    render(<WordLibraryScreen />);
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getAllByText(/2 words/).length).toBeGreaterThan(0);
  });

  it('adds a new word to an expanded category', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: 'Expand Animals' }));
    const input = screen.getByPlaceholderText('Add a word...');
    await user.type(input, 'Elephant');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Elephant')).toBeInTheDocument();
  });

  it('rejects duplicate words', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: 'Expand Animals' }));
    const input = screen.getByPlaceholderText('Add a word...');
    await user.type(input, 'Dog');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(
      screen.getByText('This word already exists in this category.'),
    ).toBeInTheDocument();
  });

  it('edits an existing word', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: 'Expand Animals' }));
    await user.click(screen.getByRole('button', { name: 'Edit Dog' }));
    const editInput = screen.getByLabelText('Word');
    await user.clear(editInput);
    await user.type(editInput, 'Duck');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Duck')).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });

  it('creates a new category', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: /Add Category/i }));
    const nameInput = screen.getByLabelText('Category Name');
    await user.type(nameInput, 'Hobbies');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Hobbies')).toBeInTheDocument();
    expect(screen.getAllByText(/0 words/).length).toBeGreaterThan(0);
  });

  it('rejects blank category names', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: /Add Category/i }));
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(
      screen.getByText('Category name cannot be blank.'),
    ).toBeInTheDocument();
  });

  it('bulk imports words one per line', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: 'Expand Animals' }));
    await user.click(screen.getByRole('button', { name: 'Bulk import...' }));
    const textarea = screen.getByLabelText('Bulk import words for Animals');
    await user.type(textarea, 'Lion\nTiger\nlion');
    await user.click(screen.getByRole('button', { name: 'Import Words' }));

    expect(screen.getByText('Lion')).toBeInTheDocument();
    expect(screen.getByText('Tiger')).toBeInTheDocument();
  });

  it('deletes a word after confirmation', async () => {
    const user = userEvent.setup();
    render(<WordLibraryScreen />);

    await user.click(screen.getByRole('button', { name: 'Expand Animals' }));
    await user.click(screen.getByRole('button', { name: 'Delete Cat' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Cat')).not.toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
  });
});
