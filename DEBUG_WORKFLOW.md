# Production Debugging Workflow Instruction

When I report a bug or production issue, please follow this systematic investigation and resolution workflow:

## 1. Information Gathering (Ask these first)
To diagnose correctly, I need:
- **Exact Error Message**: Full stack trace and any logs (Pino/CloudWatch).
- **Steps to Reproduce**: Detailed actions taken leading to the error.
- **Environment Details**: Which environment (Prod/Staging), browser/version, and impacted `userId`.
- **System Impact**: Is it a complete outage or a minor feature failure?

## 2. Preliminary Analysis
Once info is provided, propose:
- **Most Likely Root Causes**: List 2-3 hypotheses based on logs and recent code changes.
- **Short-term Mitigation**: Can we disable the feature or rollback to stop the bleeding?

## 3. Deep-Dive Investigation
Provide a step-by-step plan:
- **Reproduce Locally**: Verify the bug exists in the dev environment.
- **Log Inspection**: Correlate `requestId` across metrics and logs.
- **Code Audit**: Analyze the suspected file/function for logic errors or race conditions.

## 4. Proposed Resolution
Propose the **Safest Fix**:
- **Design**: Minimal changes to fix the root cause.
- **Verification**: New test case (Vitest) to prevent regression.
- **Release Strategy**: Hotfix vs. regular release path.

## 5. Verification & Post-Mortem
- **Post-Fix Validation**: Re-run the smoke test script (`npm run test:smoke`).
- **Remediation**: Can we add more logs or constraints to prevent this specific issue in the future?

---
**Instruction Note**: Never make code changes during debugging without first identifying the root cause and getting approval for the "Safest Fix" strategy.
