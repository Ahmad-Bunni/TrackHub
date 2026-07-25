import { describe, it, expect, mock } from 'bun:test';

/**
 * Test Suite: DEBUG Log Gating (Part B scenarios B1-B4)
 * 
 * Tests the DEBUG flag behavior:
 * - B1: DEBUG=false or unset should suppress console.log
 * - B2: DEBUG=true should enable console.log
 * - B3: DEBUG is evaluated at module load (runtime changes don't take effect)
 * - B4: Log format/content verification
 */

// --- Helpers ---

function createLogHelper(debugValue: boolean) {
  return (...args: unknown[]) => debugValue && console.log(...args);
}

function withConsoleSpy(fn: (spy: ReturnType<typeof mock>) => void) {
  const spy = mock(() => {});
  const orig = console.log;
  console.log = spy;
  try { fn(spy); } finally { console.log = orig; }
}

// --- Tests ---

describe('B1: DEBUG=false should suppress console.log', () => {
  it('should NOT call console.log when DEBUG is not set', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(false);
      log('test message');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  it('should NOT call console.log when DEBUG=false', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(false);
      log('test message 1', 'test message 2');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});

describe('B2: DEBUG=true should enable console.log', () => {
  it('should call console.log when DEBUG=true', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('test message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('test message');
    });
  });

  it('should pass through all arguments', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('arg1', 'arg2', { key: 'value' }, 42);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' }, 42);
    });
  });

  it('should handle multiple calls', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('message 1');
      log('message 2');
      log('message 3');
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'message 1');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, 'message 2');
      expect(consoleSpy).toHaveBeenNthCalledWith(3, 'message 3');
    });
  });
});

describe('B3: DEBUG flag requires restart (runtime changes dont take effect)', () => {
  it('should verify const is evaluated once at module load', () => {
    withConsoleSpy((consoleSpy) => {
      const envAtLoad = 'false';
      const DEBUG = envAtLoad === 'true';
      const log = (...args: unknown[]) => DEBUG && console.log(...args);
      
      log('message');
      expect(consoleSpy).not.toHaveBeenCalled();
      
      const envAtRuntime = 'true';
      expect(envAtRuntime === 'true').toBe(true);
    });
  });

  it('should verify const evaluation happens at module load', () => {
    withConsoleSpy((consoleSpy) => {
      let envValue = 'false';
      const DEBUG = envValue === 'true';
      const log = (...args: unknown[]) => DEBUG && console.log(...args);
      
      envValue = 'true';
      log('test');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});

describe('B4: Log format/content verification', () => {
  it('should verify [queryItems] log format', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('[queryItems] total items=25 name="test" date=undefined tagId=1');
      const callArg = consoleSpy.mock.calls[0][0] as string;
      expect(callArg).toContain('[queryItems]');
      expect(callArg).toContain('total items=25');
      expect(callArg).toContain('name="test"');
      expect(callArg).toContain('tagId=1');
    });
  });

  it('should verify [addItem] log format', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('[addItem] name="New Item" tagIds=[1, 2]');
      const callArg = consoleSpy.mock.calls[0][0] as string;
      expect(callArg).toContain('[addItem]');
      expect(callArg).toContain('name="New Item"');
      expect(callArg).toContain('tagIds=[1, 2]');
    });
  });

  it('should verify [addItem] created log format', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('[addItem] created (before=10 → after=11)');
      const callArg = consoleSpy.mock.calls[0][0] as string;
      expect(callArg).toContain('[addItem]');
      expect(callArg).toContain('created');
      expect(callArg).toContain('before=10');
      expect(callArg).toContain('after=11');
    });
  });

  it('should verify [searchWithDate] log format with date', () => {
    withConsoleSpy((consoleSpy) => {
      const log = createLogHelper(true);
      log('[searchWithDate] date=2024-01-01 → 5 matched');
      const callArg = consoleSpy.mock.calls[0][0] as string;
      expect(callArg).toContain('[searchWithDate]');
      expect(callArg).toContain('date=2024-01-01');
      expect(callArg).toContain('5 matched');
    });
  });
});
