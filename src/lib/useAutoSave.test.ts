import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';
import { useEditorStore } from './store';
import { createProject, createShapeLayer } from './factories';
import * as db from './db';

// Regression coverage for a real bug: useAutoSave's effect used to depend on
// `saveStatus`. Flipping status to 'saving' re-ran the same effect (since it
// was a dependency), and that re-run's cleanup cleared the debounce timer
// that had just been scheduled — before it ever fired. The save was silently
// dropped every time: no error, no persisted write, and the toolbar spinner
// stuck on "saving" forever. See useAutoSave.ts for the fix and full
// explanation. These tests fail against the old, buggy implementation.

vi.mock('./db', async (importOriginal) => {
  const actual = await importOriginal<typeof db>();
  return { ...actual, saveProject: vi.fn(async () => {}) };
});

const saveProjectMock = vi.mocked(db.saveProject);

beforeEach(() => {
  vi.useFakeTimers();
  saveProjectMock.mockClear();
  saveProjectMock.mockImplementation(async () => {});
  useEditorStore.getState().setProject(createProject('Test project', '2d', '16:9'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAutoSave', () => {
  it('does not save on initial mount (freshly loaded project is already "saved")', async () => {
    renderHook(() => useAutoSave());
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(saveProjectMock).not.toHaveBeenCalled();
  });

  it('saves ~2s after an edit and flips status to "saved" once persisted', async () => {
    renderHook(() => useAutoSave());

    // `act()` flushes the effect synchronously, so by the time it returns,
    // useAutoSave has already reacted to the edit and flipped the status to
    // 'saving' (the debounce timer is now pending — it just hasn't fired).
    act(() => {
      useEditorStore.getState().addLayer(createShapeLayer());
    });
    expect(useEditorStore.getState().saveStatus).toBe('saving');

    // Not yet — the debounce hasn't elapsed.
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(saveProjectMock).not.toHaveBeenCalled();
    expect(useEditorStore.getState().saveStatus).toBe('saving');

    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveProjectMock).toHaveBeenCalledTimes(1);
    expect(useEditorStore.getState().saveStatus).toBe('saved');
  });

  it('debounces rapid successive edits into a single save of the latest state', async () => {
    renderHook(() => useAutoSave());

    const layer = createShapeLayer();
    act(() => {
      useEditorStore.getState().addLayer(layer);
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      useEditorStore.getState().updateLayer(layer.id, { x: 42 } as never);
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      useEditorStore.getState().updateLayer(layer.id, { x: 999 } as never);
    });

    // Each edit resets the 2s debounce — well under 2s of total elapsed time
    // since the *last* edit, nothing should have saved yet.
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveProjectMock).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(saveProjectMock).toHaveBeenCalledTimes(1);
    const saved = saveProjectMock.mock.calls[0][0];
    const savedLayer = saved.scenes[0].layers.find((l) => l.id === layer.id) as { x: number };
    expect(savedLayer.x).toBe(999);
  });

  it('reverts to "unsaved" and does not crash when the underlying save fails', async () => {
    saveProjectMock.mockImplementation(async () => {
      throw new Error('quota exceeded');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useAutoSave());
    act(() => {
      useEditorStore.getState().addLayer(createShapeLayer());
    });
    await act(() => vi.advanceTimersByTimeAsync(2500));

    expect(saveProjectMock).toHaveBeenCalledTimes(1);
    expect(useEditorStore.getState().saveStatus).toBe('unsaved');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
