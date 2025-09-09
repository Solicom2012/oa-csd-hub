# ----------------------------
# Angular SPA Deploy Script with Dev/Prod Option
# ----------------------------

# مسیر پروژه
$projectPath = "D:\oa-csd-hub"
$distFolder = "$projectPath\dist/oa-csd-hub"

# توکن و اطلاعات Vercel
$vercelToken = "YOUR_VERCEL_TOKEN"
$vercelScope = "YOUR_VERCEL_USERNAME_OR_TEAM"
$vercelProject = "oa-csd-hub"

# ----------------------------
# انتخاب محیط Deploy
# ----------------------------
$envOption = Read-Host "Select deployment environment (Dev/Prod)"
$envOption = $envOption.ToLower()

if ($envOption -eq "prod") {
    $vercelFlag = "--prod"
    Write-Host "Deploying to PRODUCTION..." -ForegroundColor Green
} else {
    $vercelFlag = ""
    Write-Host "Deploying to DEV (Preview)..." -ForegroundColor Yellow
}

try {
    # ----------------------------
    # 0. وارد پوشه پروژه
    # ----------------------------
    Set-Location $projectPath
    Write-Host "Changed directory to project path." -ForegroundColor Cyan

    # ----------------------------
    # 1. حذف build قدیمی
    # ----------------------------
    Write-Host "Step 1: Removing old build..." -ForegroundColor Cyan
    if (Test-Path $distFolder) {
        Remove-Item -Recurse -Force $distFolder
        Write-Host "Old build removed." -ForegroundColor Green
    } else {
        Write-Host "No previous build found." -ForegroundColor Yellow
    }

    # ----------------------------
    # 2. ساخت build جدید
    # ----------------------------
    Write-Host "Step 2: Building Angular project..." -ForegroundColor Cyan
    ng build --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Build completed successfully." -ForegroundColor Green

    # نمایش جزئیات فایل‌ها
    Write-Host "Build file sizes:" -ForegroundColor Cyan
    Get-ChildItem -Recurse $distFolder | Where-Object { -not $_.PSIsContainer } |
    ForEach-Object { Write-Host "$($_.FullName) - $([math]::Round($_.Length / 1KB, 2)) KB" }

    # ----------------------------
    # 3. اضافه کردن build به Git
    # ----------------------------
    Write-Host "Step 3: Adding build to Git..." -ForegroundColor Cyan
    git add -f $distFolder
    if ($LASTEXITCODE -ne 0) { Write-Host "Failed to add build to Git!" -ForegroundColor Red; exit 1 }

    # ----------------------------
    # 4. Commit تغییرات
    # ----------------------------
    $commitMessage = "Update Angular build for Vercel ($envOption) - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m "$commitMessage" 2>$null
    Write-Host "Changes committed (if any)." -ForegroundColor Green

    # ----------------------------
    # 5. Push به GitHub
    # ----------------------------
    Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    if ($LASTEXITCODE -ne 0) { Write-Host "Push failed!" -ForegroundColor Red; exit 1 }

    # ----------------------------
    # 6. Deploy به Vercel
    # ----------------------------
    Write-Host "Step 6: Deploying to Vercel..." -ForegroundColor Cyan
    $deployCmd = "vercel $vercelFlag --confirm --token $vercelToken --scope $vercelScope"
    $output = Invoke-Expression $deployCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "Vercel deploy failed!" -ForegroundColor Red; exit 1 }

    # نمایش URL پروژه
    $urlMatch = ($output | Select-String -Pattern "https://.*\.vercel\.app").Matches
    if ($urlMatch.Count -gt 0) {
        Write-Host "Your project is live at:" -ForegroundColor Green
        Write-Host $urlMatch[0].Value -ForegroundColor Yellow
    } else {
        Write-Host "Could not automatically detect Vercel URL. Check Vercel dashboard." -ForegroundColor Yellow
    }

    Write-Host "Deployment completed successfully!" -ForegroundColor Green

} catch {
    Write-Host "An unexpected error occurred: $_" -ForegroundColor Red
    exit 1
}
