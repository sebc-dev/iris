import { describe, it, expect } from 'vitest';
import { MAX_LINE_LENGTH } from './constants';

describe('constants', () => {
	it('MAX_LINE_LENGTH should be 204', () => {
		expect(MAX_LINE_LENGTH).toBe(204);
	});
});
