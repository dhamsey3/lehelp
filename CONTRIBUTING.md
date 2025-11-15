# Contributing to LEHELP

Thank you for your interest in contributing to the LEHELP platform! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Sexual language or imagery
- Other conduct inappropriate in a professional setting

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Describe the problem and proposed solution
4. Explain use cases and benefits

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Update documentation
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Development Guidelines

### Code Style

**TypeScript/JavaScript:**
- Use TypeScript for new code
- Follow ESLint configuration
- Use Prettier for formatting
- Meaningful variable names
- Comment complex logic

**Python:**
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Use Black for formatting

### Commit Messages

Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Example: `feat(auth): add anonymous registration`

### Testing

- Write unit tests for new features
- Maintain test coverage above 80%
- Include integration tests for APIs
- Test edge cases and error handling

### Documentation

- Update README.md if needed
- Document new APIs
- Include JSDoc/docstrings
- Update relevant guides

### Security

- Never commit secrets or credentials
- Use environment variables
- Follow security best practices
- Report security issues privately

## Project Structure

```
/backend          - Backend services
/frontend         - Web applications
/mobile           - Mobile applications
/ai-services      - AI/ML services
/shared           - Shared libraries
/infrastructure   - Deployment configs
/docs             - Documentation
/tests            - Test files
```

## Getting Started

1. **Set up development environment:**
   ```bash
   git clone https://github.com/lehelp/platform.git
   cd platform
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. All comments addressed
4. Documentation updated
5. Tests passing
6. No merge conflicts

## Community

- GitHub Discussions for questions
- Slack/Discord for real-time chat
- Monthly contributor calls
- Email: contributors@lehelp.org

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor events

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.

## Questions?

Feel free to reach out:
- GitHub Discussions
- Email: contributors@lehelp.org
- Community chat

Thank you for contributing to LEHELP! 🌟
