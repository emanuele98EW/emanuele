$baseDir = Get-Location
$folders = @("engineering", "finanza")

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $files = Get-ChildItem -Path $folder -Filter "*.html" -Recurse
        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Raw
            if ([string]::IsNullOrWhiteSpace($content)) { continue }
            if (-not $content.Contains("main.js")) {
                $relPath = $file.FullName.Substring($baseDir.Path.Length + 1)
                $depth = ($relPath.Split([IO.Path]::DirectorySeparatorChar).Count) - 1
                $prefix = ""
                for ($i = 0; $i -lt $depth; $i++) {
                    $prefix += "../"
                }
                
                $scriptTag = "`n<script src=`"$prefix`js/main.js`"></script>`n"
                $content = $content.Replace("</body>", "$scriptTag</body>")
                
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8
                Write-Host "Injected main.js into $($file.FullName)"
            }
        }
    }
}
