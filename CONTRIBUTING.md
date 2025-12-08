# Contributing to SplitSmart

Thank you for your interest in contributing to SplitSmart! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/splitsmart.git`
3. Install dependencies:
   ```bash
   cd splitsmart/backend && npm install
   cd ../frontend && npm install
   ```
4. Set up environment variables (see README.md)
5. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns
- Use async/await for asynchronous operations
- Handle errors gracefully with try-catch blocks

## Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature: description"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

## Commit Message Guidelines

- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues if applicable: "Fix #123: Description"

Examples:
- `Add expense filtering by date range`
- `Fix balance calculation for custom splits`
- `Update README with deployment instructions`
- `Refactor database connection handling`

## Testing

Before submitting a PR, ensure:
- All existing features still work
- New features are tested manually
- No console errors in browser or server
- Database operations complete successfully
- API endpoints return expected responses

## Pull Request Process

1. Update documentation if needed
2. Ensure your code follows the style guidelines
3. Test all functionality
4. Describe your changes in the PR description
5. Link any related issues

## Feature Ideas

Want to contribute but not sure what to work on? Here are some ideas:

- Add user authentication
- Implement expense categories with icons
- Add expense search functionality
- Create expense analytics/charts
- Add export to CSV/PDF
- Implement recurring expenses
- Add email notifications
- Create mobile app version
- Add multi-currency support
- Implement expense comments/notes

## Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/device information
- Console errors

## Questions?

Feel free to open an issue for questions or discussions!

Thank you for contributing! 🙏
