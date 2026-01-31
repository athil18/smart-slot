# Feature Iteration Workflow Instruction

When I ask for a new feature, please follow this strict workflow to ensure safety and system integrity:

## 1. Requirement & Analysis
- **Restate Requirements**: Summarize the feature implementation in your own words.
- **Edge Cases**: Identify potential failures (e.g., duplicate data, unauthorized access, missing inputs).

## 2. Minimal Code Proposal
- **Design**: List the specific files and functions that need updating.
- **Complexity**: Aim for the simplest implementation that satisfies requirements.

## 3. Backend (API & DB)
- **DB Schema**: Define any Prisma model changes or new indexes.
- **API Endpoints**: Outline new routes or payload changes.
- **Repository/Service**: Detail the data access logic.

## 4. Frontend Integration
- **Components**: List new or updated UI components.
- **State Management**: Explain how data flows from API to UI.

## 5. Automated Tests
- **Backend Tests**: Provide unit and integration test snippets (Vitest/Supertest).
- **Security Check**: Confirm no new vulnerabilities are introduced (auth/input validation).

## 6. Local Verification
- **Steps**: Provide CLI commands to verify the feature works as expected.
- **Success Criteria**: Define what "completed" looks like for this specific feature.

---
**Instruction Note**: Always wait for my approval after Step 1 and 2 (restating requirements and proposing changes) before proceeding to implementation.
