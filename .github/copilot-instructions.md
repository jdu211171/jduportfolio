Environment Context: We use Bun for package management; please tailor command suggestions and installation examples for Bun.

Modification Scope: Modify only the parts of the code directly related to the request.

Preservation: Preserve all formatting and original names, and retain comments, annotations, and documentation verbatim unless explicitly requested otherwise.

Error Handling: After making modifications, check for TypeScript errors by running `bun run check-errors` and fix any issues before finalizing the code output. Additional error-checking steps are not required.

Output Format: If modifications are applied, output the complete code (not just a diff) so I can easily copy and paste it.

TODO Management: For complex, long-running tasks that may span multiple sessions or exceed context limits:
1. **Create TODO Lists**: When working on large features or refactoring tasks, add a TODO comment block at the top of relevant files with a clear list of remaining tasks. Use the format:
   ```
   /*
   TODO: [Feature/Task Name]
   - [ ] Task 1: Description
   - [ ] Task 2: Description
   - [x] Task 3: Completed description
   - [ ] Task 4: Description
   */
   ```
2. **Check for Existing TODOs**: Before starting work on any file, always check if there are existing TODO comments. If found, prioritize completing those tasks instead of creating new ones.
3. **Update TODOs**: On each modification session, update the TODO list by marking completed tasks with [x] and adding new discovered subtasks if needed.
4. **Remove Completed TODOs**: When all items in a TODO list are completed, remove the entire TODO block from the file.
5. **Context Continuity**: Use TODOs to maintain progress across sessions where context limits might interrupt work. Include enough detail in each TODO item so that work can be resumed effectively.
