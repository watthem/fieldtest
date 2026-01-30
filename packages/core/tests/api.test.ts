/**
 * Core API Tests - Linked to docs/reference/api.md
 *
 * These tests validate that the actual implementation matches
 * the documented API in docs/reference/api.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { specSection, linkedDescribe, linkedIt, type LoadedSpec } from '@fieldtest/doc-ref/vitest';
import { parseMarkdown, validateWithSchema, serializeMarkdown, z, validate, formatZodError } from '../src';

// Set docs root relative to this test file
const DOCS_ROOT = '../../../docs';

describe('Core API - docs/reference/api.md', () => {
  // ==========================================================================
  // parseMarkdown
  // ==========================================================================
  describe('parseMarkdown', () => {
    it('parses markdown with frontmatter into FieldTestDocument', () => {
      const markdown = `---
title: "Test Post"
author: "Jane"
published: true
---

# Hello World

Content here.
`;
      const doc = parseMarkdown(markdown);

      // FieldTestDocument structure per api.md
      expect(doc).toHaveProperty('raw');
      expect(doc).toHaveProperty('frontmatter');
      expect(doc).toHaveProperty('body');

      // Values
      expect(doc.raw).toBe(markdown);
      expect(doc.frontmatter).toEqual({
        title: 'Test Post',
        author: 'Jane',
        published: true,
      });
      expect(doc.body.trim()).toBe('# Hello World\n\nContent here.');
    });

    it('handles markdown without frontmatter', () => {
      const markdown = '# Just Content\n\nNo frontmatter here.';
      const doc = parseMarkdown(markdown);

      expect(doc.frontmatter).toEqual({});
      expect(doc.body.trim()).toBe('# Just Content\n\nNo frontmatter here.');
    });

    it('handles empty frontmatter', () => {
      const markdown = `---
---

Content only.
`;
      const doc = parseMarkdown(markdown);
      expect(doc.frontmatter).toEqual({});
    });
  });

  // ==========================================================================
  // validateWithSchema
  // ==========================================================================
  describe('validateWithSchema', () => {
    const blogSchema = z.object({
      title: z.string(),
      author: z.string(),
      published: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    });

    it('validates data against schema and returns typed result on success', async () => {
      const data = {
        title: 'My Post',
        author: 'Alice',
        published: true,
        tags: ['typescript', 'testing'],
      };

      const result = await validateWithSchema(blogSchema, data);

      // Success case - no issues property
      expect(result).not.toHaveProperty('issues');
      expect(result).toEqual(data);
    });

    it('returns FailureResult with issues on validation failure', async () => {
      const data = {
        title: 123, // Should be string
        author: 'Alice',
      };

      const result = await validateWithSchema(blogSchema, data);

      // Failure case - has issues property
      expect(result).toHaveProperty('issues');
      if ('issues' in result) {
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.issues[0]).toHaveProperty('message');
      }
    });

    it('throws error when throwOnError option is true', async () => {
      const data = { title: 123 };

      await expect(
        validateWithSchema(blogSchema, data, { throwOnError: true })
      ).rejects.toThrow();
    });

    it('signature is (schema, data, options?) as documented', async () => {
      // This test verifies the parameter order matches documentation
      const schema = z.object({ name: z.string() });
      const data = { name: 'test' };
      const options = { throwOnError: false };

      // Correct order: schema first, then data, then options
      const result = await validateWithSchema(schema, data, options);
      expect(result).not.toHaveProperty('issues');
    });
  });

  // ==========================================================================
  // serializeMarkdown
  // ==========================================================================
  describe('serializeMarkdown', () => {
    it('serializes frontmatter and body back to markdown string', () => {
      const frontmatter = {
        title: 'My Post',
        draft: false,
      };
      const body = '# Hello\n\nContent here.';

      const markdown = serializeMarkdown(frontmatter, body);

      // Should contain frontmatter delimiters
      expect(markdown).toContain('---');
      expect(markdown).toContain('title: My Post');
      expect(markdown).toContain('draft: false');
      expect(markdown).toContain('# Hello');
      expect(markdown).toContain('Content here.');
    });

    it('signature is (frontmatter, body) as documented', () => {
      // Verify correct parameter order
      const result = serializeMarkdown({ key: 'value' }, 'body text');
      expect(typeof result).toBe('string');
    });

    it('round-trips with parseMarkdown', () => {
      const originalFrontmatter = {
        title: 'Test',
        count: 42,
        enabled: true,
      };
      const originalBody = '# Content\n\nSome text here.';

      const serialized = serializeMarkdown(originalFrontmatter, originalBody);
      const parsed = parseMarkdown(serialized);

      expect(parsed.frontmatter).toEqual(originalFrontmatter);
      // Body may have slight whitespace differences, so trim
      expect(parsed.body.trim()).toBe(originalBody);
    });
  });

  // ==========================================================================
  // Validation Library (z, validate, formatZodError)
  // ==========================================================================
  describe('Validation Library', () => {
    describe('z (Zod re-export)', () => {
      it('exports Zod schema builder', () => {
        expect(z).toBeDefined();
        expect(z.object).toBeTypeOf('function');
        expect(z.string).toBeTypeOf('function');
        expect(z.number).toBeTypeOf('function');
        expect(z.boolean).toBeTypeOf('function');
        expect(z.array).toBeTypeOf('function');
      });

      it('can create and use schemas', () => {
        const schema = z.object({
          title: z.string().min(1),
          tags: z.array(z.string()).optional(),
        });

        const result = schema.safeParse({ title: 'Hello' });
        expect(result.success).toBe(true);
      });
    });

    describe('validate', () => {
      it('returns tuple [success, result]', () => {
        const schema = z.object({ name: z.string() });

        const [success, result] = validate(schema, { name: 'Alice' });

        expect(success).toBe(true);
        expect(result).toEqual({ name: 'Alice' });
      });

      it('returns [false, ZodError] on failure', () => {
        const schema = z.object({ name: z.string() });

        const [success, result] = validate(schema, { name: 123 });

        expect(success).toBe(false);
        expect(result).toBeInstanceOf(z.ZodError);
      });
    });

    describe('formatZodError', () => {
      it('formats ZodError into readable string', () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        const [success, result] = validate(schema, { name: 123, age: 'wrong' });

        expect(success).toBe(false);
        if (!success && result instanceof z.ZodError) {
          const formatted = formatZodError(result);
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);
        }
      });
    });
  });

  // ==========================================================================
  // Integration Test: Full Workflow
  // ==========================================================================
  describe('Integration: Full validation workflow', () => {
    it('validates markdown content end-to-end as shown in docs', async () => {
      const blogSchema = z.object({
        title: z.string(),
        author: z.string(),
        published: z.boolean(),
        tags: z.array(z.string()).optional(),
      });

      const markdown = `---
title: "Getting Started with FieldTest"
author: "Jane Developer"
published: true
tags: ["typescript", "validation", "markdown"]
---

# Getting Started

This post shows how easy it is to validate content with FieldTest!
`;

      // Step 1: Parse markdown
      const doc = parseMarkdown(markdown);
      expect(doc.frontmatter.title).toBe('Getting Started with FieldTest');

      // Step 2: Validate frontmatter
      const result = await validateWithSchema(blogSchema, doc.frontmatter);

      // Step 3: Check result
      if ('issues' in result) {
        throw new Error(`Validation failed: ${result.issues.map(i => i.message).join(', ')}`);
      }

      // Type-safe access to validated data
      expect(result.title).toBe('Getting Started with FieldTest');
      expect(result.author).toBe('Jane Developer');
      expect(result.published).toBe(true);
      expect(result.tags).toEqual(['typescript', 'validation', 'markdown']);
    });
  });
});
