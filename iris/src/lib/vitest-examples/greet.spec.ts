import { describe, it, expect } from 'vitest';
import { greet } from './greet';

describe('greet', () => {
	it('greet_with_valid_name_returns_hello_name_exclamation', () => {
		// Arrange
		const name = 'Svelte';

		// Act
		const result = greet(name);

		// Assert
		expect(result).toBe('Hello, Svelte!');
	});

	it('greet_with_empty_string_returns_hello_exclamation', () => {
		// Arrange
		const name = '';

		// Act
		const result = greet(name);

		// Assert
		expect(result).toBe('Hello, !');
	});

	it('greet_with_special_characters_returns_hello_special_chars_exclamation', () => {
		// Arrange
		const name = 'O\'Brien & "Co"';

		// Act
		const result = greet(name);

		// Assert
		expect(result).toBe('Hello, O\'Brien & "Co"!');
	});
});
