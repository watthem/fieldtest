# Contributing to FieldTest

Thank you for your interest in contributing to FieldTest! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PNPM 8 or higher
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**

```bash
git clone https://github.com/YOUR_USERNAME/fieldtest.git
cd fieldtest
```

3. **Install dependencies:**

```bash
pnpm install
```

4. **Create a branch:**

```bash
git checkout -b feat/your-feature-name
```

## Development Workflow

### Running Development Server

```bash
pnpm dev
```

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting and Formatting

```bash
# Lint code
pnpm biome:lint

# Format code
pnpm biome:format

# Check and fix all issues
pnpm biome:fix
```

## Project Structure

```
fieldtest/
├── packages/
│   ├── core/              # Core markdown processing
│   ├── validate/          # Validation utilities
│   ├── registry/          # Schema registry
│   ├── examples/          # Example implementations
│   └── integrations/      # MCP, Obsidian, etc.
├── grit-plugins/          # Biome GritQL plugins
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── tests/                 # Test files
```

## Contribution Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code style (enforced by Biome)
- Write clear, self-documenting code
- Add comments for complex logic

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or tooling changes

**Examples:**

```bash
feat(validation): add support for nested object schemas

fix(parser): handle markdown files with no frontmatter

docs(api): update validateWithSchema documentation
```

### Pull Request Process

1. **Update documentation** for any user-facing changes
2. **Add tests** for new features
3. **Ensure all tests pass:** `pnpm test`
4. **Run linting:** `pnpm biome:fix`
5. **Update CHANGELOG.md** with your changes
6. **Create a pull request** with a clear description

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Tested with example projects

## Checklist

- [ ] Code follows project style
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] All tests pass
```

## Areas for Contribution

### 🐛 Bug Fixes

Found a bug? Please:

1. Check if an issue already exists
2. If not, create a new issue with reproduction steps
3. Submit a pull request with the fix

### ✨ New Features

Before working on a new feature:

1. Open an issue to discuss the feature
2. Get feedback from maintainers
3. Implement the feature in a pull request

### 📖 Documentation

Documentation improvements are always welcome:

- Fix typos or unclear sections
- Add examples
- Improve API documentation
- Write tutorials or guides

### 🔌 Biome Plugins

Create custom GritQL plugins for common patterns:

1. Add `.grit` file to `grit-plugins/`
2. Update `grit-plugins/README.md`
3. Add tests for the plugin
4. Document what the plugin catches

### 🎨 Examples

Add real-world examples to `packages/examples/`:

- Framework integrations
- Use case demonstrations
- Schema examples

## Testing

### Writing Tests

Use Vitest for testing:

```typescript
import { describe, it, expect } from 'vitest';
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

describe('validateWithSchema', () => {
  it('should validate valid content', () => {
    const schema = loadUserSchema({
      version: '1',
      name: 'test',
      fields: {
        title: { type: 'string', required: true }
      }
    });

    const content = '---\ntitle: "Test"\n---\nContent';
    const result = validateWithSchema(content, schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation

### Writing Documentation

Follow the [Diátaxis framework](https://diataxis.fr/):

- **Tutorials** — Learning-oriented, step-by-step guides
- **How-to Guides** — Problem-oriented, goal-focused
- **Reference** — Information-oriented, technical details
- **Explanation** — Understanding-oriented, conceptual

### Documentation Structure

```
docs/
├── getting-started.md     # Tutorial
├── guides/                # How-to guides
├── reference/             # API reference
└── explainers/            # Conceptual articles
```

## Release Process

Releases are handled by maintainers:

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x`
4. Push tag: `git push --tags`
5. Publish to npm: `pnpm publish`

## Getting Help

- 💬 [GitHub Discussions](https://github.com/watthem/fieldtest/discussions)
- 🐛 [Issue Tracker](https://github.com/watthem/fieldtest/issues)
- 📧 Email: <hello@matthewhendricks.net>

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

### Unacceptable Behavior

- Harassment or discrimination
- Personal attacks
- Trolling or inflammatory comments
- Publishing private information

## Recognition

Contributors will be:

- Listed in CHANGELOG.md
- Credited in release notes
- Recognized in project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FieldTest! 🎉
