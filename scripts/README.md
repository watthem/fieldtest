# Scripts

This directory contains utility scripts for automating common development tasks, build processes, or other project-related operations.

## Available Scripts

- `commit_changes.sh`:
  - **Purpose**: Automates the process of running `npx repomix`, moving its output to the `artifacts/` directory, and committing all changes to Git.
  - **Usage (Unix-like)**: `./scripts/commit_changes.sh`
  - **Details**: Prompts for a commit message before proceeding.

- `commit_changes.ps1`:
  - **Purpose**: PowerShell equivalent of `commit_changes.sh` for Windows users.
  - **Usage (Windows PowerShell)**: `.\scripts\commit_changes.ps1`
  - **Details**: Prompts for a commit message. May require adjusting PowerShell execution policy.

## Adding New Scripts

When adding new scripts, please:
1.  Place them in this directory.
2.  Ensure they are well-commented.
3.  If applicable, provide versions for both Bash (Unix-like) and PowerShell (Windows).
4.  Update this `README.md` file to include a description and usage instructions for the new script.

```bash
python scripts/my_script.py
```

