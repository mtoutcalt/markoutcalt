# Pair Programming Workflow
## Overview
This document outlines our pair programming workflow for building and maintaining Mark Outcalt's personal website and blog. It ensures consistent process, proper testing, and knowledge capture as we work through content creation, feature development, and site improvements.

## Story Workflow Process

### 1. Story Selection & Planning
**Claude's Actions:**

- Pick up the next task from project backlog or user request
- Review requirements for content creation, feature implementation, or site improvements
- Create a brief implementation plan (2-3 bullet points)
- Confirm plan with human before proceeding

### 2. Implementation Preparation
**Claude's Actions:**

- After brief plan is approved by human, create a comprehensive implementation plan
- Build a detailed todo list for the task using TodoWrite tool
- Review CLAUDE.md for project-specific commands and architecture notes
- Update todo list to mark task as "in_progress"
- Read any relevant existing files to understand current state

### 3. Implementation
**Claude's Actions:**

- Implement the task following acceptance criteria
- Write clean, well-structured code following established Astro patterns
- Follow existing component and styling conventions
- Use proper MDX formatting for content creation
- Maintain consistency with existing design and theme

### 4. Testing & Verification
**Claude's Actions:**

- Run development server to verify changes: `npm run dev`
- Execute build commands to verify no compilation errors: `npm run build`
- Test production behavior with: `npm run preview`
- Run Playwright tests if applicable: `npm run test`
- Verify responsive design and theme compatibility
- Check content formatting and metadata

### 5. Human Verification Request
**Claude's Actions:**

- Summarize what was implemented
- List what should be visible/testable on the site
- Provide specific testing steps for the human
- Prompt human to verify in running site

**Required format:**

```
## Task Implementation Complete!

Changes made:
- [Bulleted list of key changes]

Please verify on the site:
1. Run `npm run dev` to start development server at localhost:4321
2. [Specific pages/sections to check]
3. [Expected behavior/content to verify]

Expected results:
- [What should be visible if working correctly]
- [Any specific UI/content changes to look for]
- [Cross-browser/responsive considerations if applicable]

Ready for your verification!
```

### 6. Human Testing & Feedback
**Human's Actions:**

- Test the changes in the running site (`npm run dev`)
- Verify requirements are met
- Check responsive behavior and theme consistency
- Provide feedback: "Perfect! That worked!" or describe issues

**If Issues Found:**
- Human describes what went wrong or what's not working
- Claude investigates and fixes the issues
- Return to step 4 (Testing & Verification) after fixes
- Repeat until verification succeeds

### 7. Task Completion
**Claude's Actions (after human confirms success):**

- Mark task as completed in todo list
- Update any relevant documentation
- Note any lessons learned or best practices discovered

## Documentation Updates

### During Each Task
Claude should update these files as needed:

**CLAUDE.md Updates**
- Add new npm scripts or commands discovered during implementation
- Update architecture notes if patterns change
- Document any new dependencies or integrations
- Note any gotchas or important considerations for Astro development

**Content Management Updates**
- Document new content categories or tags used
- Note effective MDX component usage patterns
- Record successful blog post structures or formats

## Quality Checks

### Before Marking Task Complete
- [ ] All requirements met
- [ ] No build errors or warnings
- [ ] Site loads correctly in development and preview modes
- [ ] Content displays properly with correct formatting
- [ ] Responsive design works across device sizes
- [ ] Dark theme compatibility maintained
- [ ] Navigation and internal links function correctly
- [ ] Human verification completed

## Code Quality Standards

### Content Creation
- Use proper MDX frontmatter with required fields
- Follow established category and tag conventions
- Optimize images and use appropriate formats
- Write clear, engaging content with proper grammar

### Development
- Follow existing Astro component patterns
- Use consistent CSS styling approaches
- Maintain accessibility standards
- Keep components modular and reusable
- Test interactive React components thoroughly

## Communication Patterns

### Starting a Task
**Claude:** "Ready for [Task Description]. My plan: [brief plan]. Does this approach sound good?"

### During Implementation
**Claude:** [Work through implementation, testing, and verification silently]

### Requesting Verification
**Claude:** "Task implementation complete! Changes: [summary]. Please verify: [specific things to check]. Ready for your verification!"

### After Human Confirmation
**Claude:** "Great! Task completed successfully. Ready for next task..."

## Emergency Procedures

### If Task Becomes Too Complex
- Break it down into smaller sub-tasks
- Document the breakdown approach
- Get human approval for the new plan

### If Content Strategy Changes Needed
- Document the change rationale
- Update content organization approach
- Get human approval before major restructuring

### If Technical Issue Encountered
- Document the issue and attempted solutions
- Propose 2-3 alternative approaches
- Ask human for guidance on best path forward

## Success Metrics

- Tasks completed per session
- Build success rate (should be 100%)
- Quality of human verification feedback
- Site performance and user experience
- Content quality and engagement potential
- Knowledge capture effectiveness

## Special Considerations for This Project

### Content Workflow
- Draft content can be created in `draftblogs/` before moving to `src/content/blog/`
- Always verify content metadata and categorization
- Test content rendering in both development and production modes

### Development Workflow
- Always test with both `npm run dev` and `npm run preview` due to Astro production differences
- Pay special attention to WSL file watching behavior
- Verify theme compatibility across all new components
- Test any interactive React components thoroughly

### Deployment Preparation
- Ensure all content has proper frontmatter
- Verify RSS feed generation works correctly
- Check sitemap generation for new content
- Test any new routes or navigation changes

This workflow ensures we maintain quality, capture knowledge, and make steady progress toward improving the site and creating engaging content.