Add-Type -AssemblyName System.Drawing

$srcFolder = "c:\Users\PrabalVerma\Documents\WEB\Sibling Help Dashboard\sis-dashboard\public\memories\*"

Get-ChildItem -Path $srcFolder -Include *.jpg, *.jpeg -File | ForEach-Object {
    $filePath = $_.FullName
    $name = $_.Name
    $len = $_.Length

    if ($len -gt 250000) {
        Write-Host "Compressing: $name ($len bytes)"
        try {
            $img = [System.Drawing.Image]::FromFile($filePath)
            $w = $img.Width
            $h = $img.Height
            
            if ($w -gt $h) {
                if ($w -gt 800) {
                    $h = [int]($h * (800 / $w))
                    $w = 800
                }
            } else {
                if ($h -gt 800) {
                    $w = [int]($w * (800 / $h))
                    $h = 800
                }
            }
            
            $newImg = New-Object System.Drawing.Bitmap($w, $h)
            $g = [System.Drawing.Graphics]::FromImage($newImg)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0, 0, $w, $h)
            
            $img.Dispose()
            
            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)
            
            $tempPath = $filePath + ".tmp"
            $newImg.Save($tempPath, $encoder, $encoderParams)
            
            $newImg.Dispose()
            $g.Dispose()
            
            Remove-Item $filePath -Force
            Rename-Item $tempPath -NewName $name
            Write-Host "Success compressing: $name"
        } catch {
            Write-Host "Error compressing: $name - $_"
        }
    }
}
