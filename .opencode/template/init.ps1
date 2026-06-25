#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Bootstrap a new project with the opencode template system.
.DESCRIPTION
    Copies template files to the project root, replaces placeholders with actual values,
    and sets up initial memory files.
.PARAMETER ProjectName
    The name of your project (e.g., "my-app", "ecommerce-backend").
.PARAMETER ProjectDescription
    A short description of your project (e.g., "E-commerce backend API service").
.PARAMETER BuildCommand
    The command to build your project (e.g., "npm run build", "cargo build", "go build ./...").
.PARAMETER TypecheckCommand
    The command to type-check your project (e.g., "npx tsc --noEmit", "cargo check", "npx pyright").
.PARAMETER DevCommand
    The command to start development server (e.g., "npm run dev", "cargo run", "go run .").
.PARAMETER ProjectPath
    The root directory of your project. Defaults to current directory.
.PARAMETER TemplateDir
    Path to the opencode template directory. Defaults to .opencode/template relative to script location.
.EXAMPLE
    .\.opencode\template\init.ps1 -ProjectName "myapp" -ProjectDescription "My Awesome App" -BuildCommand "npm run build" -TypecheckCommand "npx tsc --noEmit"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [Parameter(Mandatory = $true)]
    [string]$ProjectDescription,

    [Parameter(Mandatory = $true)]
    [string]$BuildCommand,

    [Parameter(Mandatory = $true)]
    [string]$TypecheckCommand,

    [Parameter(Mandatory = $false)]
    [string]$DevCommand = $BuildCommand,

    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [string]$TemplateDir = ""
)

# Resolve template directory
if (-not $TemplateDir) {
    $ScriptPath = $PSScriptRoot
    if (-not $ScriptPath) {
        $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    $TemplateDir = $ScriptPath
}

$RootDir = $ProjectPath

Write-Host "🚀 Initializing opencode project: $ProjectName" -ForegroundColor Green
Write-Host "   Description: $ProjectDescription" -ForegroundColor Cyan
Write-Host "   Template: $TemplateDir" -ForegroundColor Cyan
Write-Host "   Target: $RootDir" -ForegroundColor Cyan
Write-Host ""

# Check if .opencode already exists
if (Test-Path "$RootDir\.opencode" -PathType Container) {
    $response = Read-Host "⚠️  .opencode directory already exists. Overwrite? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Aborted." -ForegroundColor Red
        exit 1
    }
}

# Ensure .opencode directory exists
New-Item -ItemType Directory -Path "$RootDir\.opencode" -Force | Out-Null

# Date for placeholder replacement
$Date = (Get-Date -Format "yyyy-MM-dd")

# Build placeholder mapping
$Placeholders = @{
    "{{project_name}}"         = $ProjectName
    "{{project_description}}"  = $ProjectDescription
    "{{build_command}}"        = $BuildCommand
    "{{typecheck_command}}"    = $TypecheckCommand
    "{{dev_command}}"          = $DevCommand
    "{{project_path}}"         = $RootDir
    "{{date}}"                 = $Date
}

# Files to process from template
$TemplateFiles = @(
    # Root-level template files
    @{ Source = "opencode.template.json"; Dest = "opencode.json" }
    @{ Source = "RULES.template.md"; Dest = "RULES.md" }
    @{ Source = ".gitignore"; Dest = ".gitignore"; Optional = $true }
    
    # Agent files
    @{ Source = "agents/master-orchestrator.md"; Dest = "agents/master-orchestrator.md" }
    @{ Source = "agents/{{project_name}}-manager.md"; Dest = "agents/$ProjectName-manager.md" }
    @{ Source = "agents/task-tracker.md"; Dest = "agents/task-tracker.md" }
    @{ Source = "agents/state-writer.md"; Dest = "agents/state-writer.md" }
    @{ Source = "agents/context-loader.md"; Dest = "agents/context-loader.md" }
    @{ Source = "agents/git-manager.md"; Dest = "agents/git-manager.md" }
    @{ Source = "agents/change-inspector.md"; Dest = "agents/change-inspector.md" }
    @{ Source = "agents/quality-gate.md"; Dest = "agents/quality-gate.md" }
    @{ Source = "agents/commit-executor.md"; Dest = "agents/commit-executor.md" }
    @{ Source = "agents/{{project_name}}-builder.md"; Dest = "agents/$ProjectName-builder.md" }
    @{ Source = "agents/component-builder.md"; Dest = "agents/component-builder.md" }
    @{ Source = "agents/data-layer-builder.md"; Dest = "agents/data-layer-builder.md" }
    @{ Source = "agents/page-assembler.md"; Dest = "agents/page-assembler.md" }
    @{ Source = "agents/context-checker.md"; Dest = "agents/context-checker.md" }
    @{ Source = "agents/{{project_name}}-context.md"; Dest = "agents/$ProjectName-context.md" }
    
    # Memory files
    @{ Source = "memory/state.md"; Dest = "memory/state.md" }
    @{ Source = "memory/tasks.md"; Dest = "memory/tasks.md" }
    @{ Source = "memory/decisions.md"; Dest = "memory/decisions.md" }
)

Write-Host "📁 Creating .opencode directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "$RootDir\.opencode\agents" -Force | Out-Null
New-Item -ItemType Directory -Path "$RootDir\.opencode\memory" -Force | Out-Null
New-Item -ItemType Directory -Path "$RootDir\.opencode\skills" -Force | Out-Null
New-Item -ItemType Directory -Path "$RootDir\.opencode\commands" -Force | Out-Null

Write-Host "📝 Generating project files..." -ForegroundColor Yellow
$FileCount = 0

foreach ($File in $TemplateFiles) {
    $SourceFile = Join-Path $TemplateDir $File.Source
    $DestFile = Join-Path $RootDir ".opencode" $File.Dest
    
    # Ensure destination directory exists
    $DestDir = Split-Path -Parent $DestFile
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    
    if (-not (Test-Path $SourceFile)) {
        if ($File.Optional) {
            Write-Host "   ⚠️  Skipping optional: $($File.Source) (not found)" -ForegroundColor DarkYellow
            continue
        } else {
            Write-Host "   ❌ ERROR: Required template file not found: $SourceFile" -ForegroundColor Red
            Write-Host "      Make sure the template directory ($TemplateDir) contains all required files." -ForegroundColor Red
            exit 1
        }
    }
    
    # Read content, replace placeholders, write
    $Content = Get-Content $SourceFile -Raw -ErrorAction Stop
    
    foreach ($key in $Placeholders.Keys) {
        $Content = $Content -replace [regex]::Escape($key), $Placeholders[$key]
    }
    
    Set-Content -Path $DestFile -Value $Content -NoNewline -Encoding utf8
    Write-Host "   ✅ Created: .opencode/$($File.Dest)" -ForegroundColor Green
    $FileCount++
}

Write-Host ""
Write-Host "✅ Template initialized successfully!" -ForegroundColor Green
Write-Host "   $FileCount files created"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .opencode/RULES.md - add your architecture constraints (Section 7)" -ForegroundColor White
Write-Host "   2. Edit .opencode/agents/$ProjectName-context.md - fill in your tech stack, routes, patterns" -ForegroundColor White
Write-Host "   3. Edit opencode.json - remove unnecessary agents or add custom ones" -ForegroundColor White
Write-Host "   4. Run your first session:" -ForegroundColor White
Write-Host "      opencode" -ForegroundColor Yellow
Write-Host ""
Write-Host "   The agent hierarchy is ready:" -ForegroundColor Cyan
Write-Host "   master-orchestrator" -ForegroundColor White
Write-Host "   ├── $ProjectName-manager → task-tracker, state-writer, context-loader" -ForegroundColor White
Write-Host "   ├── $ProjectName-builder → component-builder, data-layer-builder, page-assembler" -ForegroundColor White
Write-Host "   ├── git-manager → change-inspector, quality-gate, commit-executor" -ForegroundColor White
Write-Host "   └── context-checker" -ForegroundColor White

Write-Host ""
Write-Host "🔒 Quality gates configured:" -ForegroundColor Cyan
Write-Host "   • Typecheck: $TypecheckCommand" -ForegroundColor White
Write-Host "   • Build: $BuildCommand" -ForegroundColor White
