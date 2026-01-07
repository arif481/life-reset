# Contributing to Life Reset

First off, thank you for considering contributing to Life Reset! 🎉

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Clear, descriptive title
- Steps to reproduce the behavior
- Expected behavior vs actual behavior
- Screenshots if applicable
- Browser/device information
- Console error messages

### 💡 Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been suggested
- Provide a clear and detailed explanation
- Explain why this feature would be useful
- Consider the implementation scope

### 🔧 Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes**
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/life-reset.git
cd life-reset

# Install dependencies (for Android builds)
npm install

# Start local server
npm start

# Or simply open index.html in your browser
```

## Project Architecture

```
app/
├── features/           # Feature modules
│   ├── tasks/         # Task management
│   ├── mood/          # Mood tracking
│   ├── journal/       # Journaling
│   ├── analytics/     # Charts & insights
│   ├── settings/      # User preferences
│   └── gamification/  # XP & badges
└── shared/
    ├── components/    # Reusable UI components
    └── utils/         # Helper functions
```

### Module Structure

Each feature follows this pattern:
- `*.data.js` - Firebase/data operations
- `*.logic.js` - Pure business logic (testable)
- `*.ui.js` - DOM manipulation
- `*.events.js` - Event handlers & coordination

## Coding Standards

### JavaScript
- Use `'use strict';` at the top of files
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused

### CSS
- Use CSS custom properties for theming
- Follow BEM-like naming conventions
- Mobile-first responsive design
- Keep specificity low

### HTML
- Semantic HTML elements
- Proper ARIA attributes for accessibility
- Escape user content to prevent XSS

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add mood trend visualization
fix: resolve offline sync issue
docs: update installation guide
refactor: extract toast component
```

## Testing

Currently, the project uses manual testing. When adding features:
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test responsive design on mobile
- Test offline functionality
- Verify Firebase data sync

## Questions?

Feel free to open an issue with the "question" label if you need help!

---

Thank you for contributing! 🙏
