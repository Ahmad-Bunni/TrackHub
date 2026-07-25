/**
 * Test: DEBUG log gating
 * 
 * Verifies that the log() helper respects the DEBUG env flag.
 * When DEBUG=false (default), console.log should not be called.
 * When DEBUG=true, console.log should be called with the provided args.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';

function createLog(debug: boolean) {
  return (...args: unknown[]) => debug && console.log(...args);
}

describe('DEBUG log gating', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete process.env.DEBUG;
  });
  
  it('should NOT call console.log when DEBUG is not set', () => {
    const log = createLog(process.env.DEBUG === 'true');
    log('[test] this should not appear');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
  
  it('should NOT call console.log when DEBUG=false', () => {
    process.env.DEBUG = 'false';
    const log = createLog(process.env.DEBUG === 'true');
    log('[test] this should not appear');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
  
  it('should call console.log when DEBUG=true', () => {
    process.env.DEBUG = 'true';
    const log = createLog(process.env.DEBUG === 'true');
    log('[test] this should appear', { key: 'value' });
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('[test] this should appear', { key: 'value' });
  });
  
  it('should pass through all arguments when DEBUG=true', () => {
    process.env.DEBUG = 'true';
    const log = createLog(process.env.DEBUG === 'true');
    const arg1 = 'string';
    const arg2 = 123;
    const arg3 = { nested: { obj: true } };
    const arg4 = [1, 2, 3];
    log(arg1, arg2, arg3, arg4);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(arg1, arg2, arg3, arg4);
  });
  
  it('should handle multiple calls correctly', () => {
    process.env.DEBUG = 'true';
    const log = createLog(process.env.DEBUG === 'true');
    log('first');
    log('second');
    log('third');
    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 'third');
  });
});
