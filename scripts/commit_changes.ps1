# Script to automate repomix generation and git commit

# Get the directory of the script and navigate to the project root
param(
    [string]$CommitMessage = $(Read-Host -Prompt "Enter commit message")
)

$ScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path -Path (Join-Path -Path $ScriptDirectory -ChildPath "..")

Set-Location -Path $ProjectRoot

Write-Host "Running in project root: $(Get-Location)"

if ([string]::IsNullOrEmpty($CommitMessage)) {
    Write-Error "Commit message cannot be empty. Aborting."
    exit 1
}

# Run npx repomix
Write-Host "Running npx repomix..."
Try {
    npx repomix
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npx repomix failed. Aborting commit."
        exit 1
    }
} Catch {
    Write-Error "Exception during npx repomix: $($_.Exception.Message). Aborting commit."
    exit 1
}

# Move repomix-output.xml to artifacts, creating artifacts directory if it doesn't exist
$ArtifactsDir = Join-Path -Path $ProjectRoot -ChildPath "artifacts"
if (-not (Test-Path -Path $ArtifactsDir)) {
    New-Item -ItemType Directory -Path $ArtifactsDir | Out-Null
}

$RepomixOutputFile = Join-Path -Path $ProjectRoot -ChildPath "repomix-output.xml"
if (Test-Path -Path $RepomixOutputFile) {
    Write-Host "Moving repomix-output.xml to $ArtifactsDir/..."
    Move-Item -Path $RepomixOutputFile -Destination $ArtifactsDir -Force
} else {
    Write-Warning "repomix-output.xml not found in project root after running npx repomix."
}

# Add all changes to git
Write-Host "Adding all changes to git..."
git add .

# Commit changes
Write-Host "Committing changes with message: '$CommitMessage'..."
git commit -m "$CommitMessage"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Changes committed successfully."
} else {
    Write-Error "Git commit failed. Please check git status and resolve any issues."
} 