const express = require("express");
const app = express();

app.get("*", (req, res) => {
  const userAgent = req.headers["user-agent"]; // 获取 User-Agent
  const requestUri = req.originalUrl; // 获取请求的 URI

  if (userAgent && userAgent.includes("WindowsPowerShell")) {
    const token = requestUri.slice(1); // 去掉 URI 的第一个字符
    res.send(`# 获取系统版本
$osVersion = [System.Environment]::OSVersion.Version

# 检查系统版本是否低于 Windows 10 (Windows 10 的主版本号是 10)
if ($osVersion.Major -lt 10) {
    Write-Host "操作系统版本过低，最低要求是 Windows 10。"
    return
}

# 获取CPU架构
$AppDataPath = [System.Environment]::GetFolderPath('LocalApplicationData')
$arch = (Get-WmiObject Win32_Processor).AddressWidth
$cpuArch = ""

# 根据架构类型设置变量
switch ($arch) {
    64 { 
        # 判断是否为ARM64架构
        if ([System.Environment]::Is64BitProcess -and $env:PROCESSOR_IDENTIFIER -like "*ARM*") {
            Write-Host "暂不支持ARM64系统"
            return
        }
        else {
            $cpuArch = "amd64"
        }
    }
    32 {
        Write-Host "暂不支持32位系统"
        return
    }
}

# 打印CPU架构
$downloadUrl = "https://dash.merg.ink/api/download?file=frpc_$cpuArch.exe"

# 检查目录是否存在，如果不存在则创建
$downloadDir = "$AppDataPath\\mergilink"
if (-not (Test-Path -Path $downloadDir)) {
    Write-Host "创建数据目录"
    New-Item -ItemType Directory -Path $downloadDir > $null 2>&1
}

# 下载保存路径
$outputPath = "$AppDataPath\\mergilink\\frpc.exe"

# 检查 frpc.exe 是否存在
if (Test-Path $outputPath) {
    
    # 执行 frpc.exe -v 并获取当前版本
    $currentVersion = & "$outputPath" -v
    Write-Host "当前 Frpc 版本: $currentVersion"
    
    # 请求最新版本信息
    try {
        $latestVersion = irm "https://dash.merg.ink/api/client/lastversion"
        Write-Host "最新 Frpc 版本: $latestVersion"
    }
    catch {
        Write-Host "无法获取最新版本信息"
        return
    }

    # 比对版本号
    if ($currentVersion -ne $latestVersion) {
        Write-Host "有新的版本，是否更新？(y/n)"
        $userInput = Read-Host
        if ($userInput -eq "y") {
            Write-Host "开始更新..."
            
            # 下载文件
            Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
            Write-Host "更新完成。"
        }
    }
    else {
        Write-Host "frpc 已是最新版本。"
    }
}
else {
    Write-Host "正在下载Frpc"
    Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
    Write-Host "下载完成"
}

# 白名单添加检测
if ([bool]([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    # 获取当前的排除路径列表
    $exclusionPaths = (Get-MpPreference).ExclusionPath

    # 要检查的 frpc.exe 路径
    $frpcPath = "$AppDataPath\\mergilink\\frpc.exe"

    # 检查 frpc.exe 是否已在白名单中
    if ($exclusionPaths -contains $frpcPath) {
    }
    else {
        Add-MpPreference -ExclusionPath $frpcPath
        Write-Host "frpc.exe 已成功添加到白名单。"
    }
}
else {
    Write-Host "Tips: 使用管理员运行将自动将 frpc 加入白名单。"
}


#下载配置文件

# 设置请求的URL
$token = "${token}"
$requestUrl = "https://dash.merg.ink/api/client/getconfig?token=$token"
# 下载配置文件
$response = Invoke-RestMethod -Uri $requestUrl -Method Get
if ($response.status -ne 200) {
    return
}
$configContent = $response.config
$filename = $response.filename
$configFilePath = "$AppDataPath\\mergilink\\$filename"

# 写入文件
$configContent | Set-Content -Path $configFilePath

##访客专用 请求下载mlmvl.exe 并启动
# 检查 mlmvl 值是否为 true
if ($response.mlmvl -eq $true) {
    # 检查 mlmvl.exe 文件路径
    $mlmvlPath = "$AppDataPath\\mergilink\\mlmvl.exe"

    # 如果文件存在则运行它
    if (Test-Path $mlmvlPath) {
        Write-Host "正在启动mlmvl..."
        Start-Process -FilePath "$mlmvlPath" -ArgumentList $response.pname, $response.rport -NoNewWindow    
    } 
    else {
        # 文件不存在，下载对应的文件
        $downloadUrl = "https://dash.merg.ink/api/download?file=mlmvl_$cpuArch.exe"
        Write-Host "mlmvl.exe 不存在，开始下载..."
        Invoke-WebRequest -Uri $downloadUrl -OutFile $mlmvlPath
        Write-Host "下载完成，文件已保存至: $mlmvlPath"

        # 下载完成后运行程序
        Start-Process -FilePath "$mlmvlPath" -ArgumentList $response.pname, $response.rport -NoNewWindow    
    }
}
#启动Frpc

& "$AppDataPath\\mergilink\\frpc.exe" -c $configFilePath`);
  } else if (userAgent && userAgent.includes("curl")) {
    res.send("echo 暂时还没写Linux/Mac");
  } else {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="apple-touch-icon" sizes="76x76" href="//cdn.qwqo.cn/file/merg/assets/images/fav.svg">
  <link rel="icon" href="//cdn.qwqo.cn/file/merg/assets/images/fav.svg">
  <title>
    主页 - MergiLink默连 </title>
  <!--     Fonts and icons     -->
  <link href="https://fonts.font.im/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
  <!-- Nucleo Icons -->
  <link href="//cdn.qwqo.cn/file/merg/assets/css/nucleo-icons.css" rel="stylesheet" />
  <link href="//cdn.qwqo.cn/file/merg/assets/css/nucleo-svg.css" rel="stylesheet" />
  <!-- Font Awesome Icons -->
  <link id="pagestyle" href="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />  <link href="//cdn.qwqo.cn/file/merg/assets/css/nucleo-svg.css" rel="stylesheet" />
  <link href="//cdn.qwqo.cn/file/merg/assets/css/nucleo-svg.css" rel="stylesheet" />
  <!-- CSS Files -->
  <link id="pagestyle" href="//cdn.qwqo.cn/file/merg/assets/css/edgelink-dashboard.css?v=2.0.4" rel="stylesheet" />
</head>

<body style="background-image:url(https://littleskin.cn/background.jpg);">
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg blur border-radius-lg top-0 z-index-3 shadow position-absolute mt-4 py-2 start-0 end-0 mx-4">
          <div class="container-fluid">
            <a class="navbar-brand font-weight-bolder ms-lg-0 ms-3 " href="/">
              MergiLink默连
            </a>
            <button class="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon mt-2">
                <span class="navbar-toggler-bar bar1"></span>
                <span class="navbar-toggler-bar bar2"></span>
                <span class="navbar-toggler-bar bar3"></span>
              </span>
            </button>
            <div class="collapse navbar-collapse" id="navigation">
              <ul class="navbar-nav mx-auto">
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center me-2 active" aria-current="page" href="/">
                    <i class="fa fa-home opacity-6 text-dark me-1"></i>
                    主页
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link me-2" href="//dash.merg.ink">
                    <i class="fas fa-key opacity-6 text-dark me-1"></i>
                    登录
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link me-2" href="https://qm.qq.com/cgi-bin/qm/qr?k=Z-KQzEz6H2eeKHWRzi3UK2SMPNwbWvtW&jump_from=webapi&authKey=fV0oEvLZHEzWS4iOWeqlPujvGhGKkK8AhYuDiW3WkY4Ag36t162UJCMJqgKjGn9p">
                    <i class="fa-brands fa-qq opacity-6 text-dark me-1"></i>
                    QQ群
                  </a>
                </li>
              </ul>
              <ul class="navbar-nav d-lg-block d-none">
                <li class="nav-item">
                  <a href="//dash.merg.ink" class="btn btn-sm mb-0 me-1 btn-primary">控制台</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <!-- End Navbar -->
      </div>
    </div>
  </div>
  <main class="main-content  mt-0">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="col-12 d-lg-flex h-100 my-auto pe-0 position-absolute top-0 end-0 text-center justify-content-center flex-column">
              <div class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden" style="background-image: url('/');
          background-size: cover;">
                <span class="mask bg-gradient-primary opacity-6"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">MergiLink默连</h4>
                <p class="text-white position-relative">让联机更加简单</p>
                <a class="text-white" href="https://xn--v6qw21h0gd43u.xn--fiqs8s/">CFU识别码-TEHFBBN8</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <!--   Core JS Files   -->
  <script src="//cdn.qwqo.cn/file/merg/assets/js/core/popper.min.js"></script>
  <script src="//cdn.qwqo.cn/file/merg/assets/js/core/bootstrap.min.js"></script>
  <script src="//cdn.qwqo.cn/file/merg/assets/js/plugins/perfect-scrollbar.min.js"></script>
  <script src="//cdn.qwqo.cn/file/merg/assets/js/plugins/smooth-scrollbar.min.js"></script>
  <script>
    var win = navigator.platform.indexOf('Win') > -1;
    if (win && document.querySelector('#sidenav-scrollbar')) {
      var options = {
        damping: '0.5'
      }
      Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
    }
  </script>
  <!-- Control Center for Soft Dashboard: parallax effects, scripts for the example pages etc -->
  <script src="//cdn.qwqo.cn/file/merg/assets/js/edgelink-dashboard.min.js?v=2.0.4"></script>
  <script defer src="https://analytic.giao.bf/script.js" data-website-id="aaff8f5b-a92c-486d-9536-282e8150dfcf"></script>
</body>

</html>`);
  }
});

// 监听端口（Vercel 会自动分配端口）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
