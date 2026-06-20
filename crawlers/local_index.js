const localSoftware = [
  {
    title: "7-Zip (24.05) - Windows 64-bit Installer",
    url: "https://www.7-zip.org/a/7z2405-x64.exe",
    source: "Official Site",
    size: 1500000,
    type: "EXE",
    description: "7-Zip is a file archiver with a high compression ratio. It supports ZIP, 7z, GZIP, BZIP2, TAR, RAR, and other formats.",
    tags: ["7zip", "7-zip", "zip", "unzip", "rar", "archive", "compress", "extract"]
  },
  {
    title: "VLC Media Player (3.0.20) - Windows 64-bit Installer",
    url: "https://get.videolan.org/vlc/3.0.20/win64/vlc-3.0.20-win64.exe",
    source: "Official Site",
    size: 42000000,
    type: "EXE",
    description: "VLC is a free and open source cross-platform multimedia player and framework that plays most multimedia files as well as DVDs, Audio CDs, VCDs, and various streaming protocols.",
    tags: ["vlc", "player", "video", "media", "music", "mp4", "mkv", "mp3", "movie"]
  },
  {
    title: "Notepad++ (8.6.5) - Windows 64-bit Installer",
    url: "https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.6.5/npp.8.6.5.Installer.x64.exe",
    source: "Official Site",
    size: 4700000,
    type: "EXE",
    description: "Notepad++ is a free source code editor and Notepad replacement that supports several languages. Running in the MS Windows environment, its use is governed by GPL License.",
    tags: ["notepad", "notepad++", "npp", "editor", "code", "text", "txt"]
  },
  {
    title: "Blender (4.1.1) - Windows 64-bit Installer",
    url: "https://ftp.nluug.nl/pub/graphics/blender/release/Blender4.1/blender-4.1.1-windows-x64.msi",
    source: "Official Site",
    size: 325000000,
    type: "MSI",
    description: "Blender is the free and open source 3D creation suite. It supports the entirety of the 3D pipeline—modeling, rigging, animation, simulation, rendering, compositing and motion tracking, video editing and 2D animation pipeline.",
    tags: ["blender", "3d", "render", "model", "animation", "graphics"]
  },
  {
    title: "WinRAR (6.24) - Windows 64-bit Installer",
    url: "https://www.rarlab.com/rar/winrar-x64-624.exe",
    source: "Official Site",
    size: 3600000,
    type: "EXE",
    description: "WinRAR is a powerful archive manager. It can backup your data and reduce the size of email attachments, decompress RAR, ZIP and other files downloaded from Internet and create new archives in RAR and ZIP file format.",
    tags: ["winrar", "rar", "zip", "archive", "compress", "extract"]
  },
  {
    title: "Mozilla Firefox (Latest) - Windows 64-bit Installer",
    url: "https://download.mozilla.org/?product=firefox-latest-ssl&os=win64&lang=en-US",
    source: "Official Site",
    size: 55000000,
    type: "EXE",
    description: "Mozilla Firefox is a free and open-source web browser developed by the Mozilla Foundation and its subsidiary, the Mozilla Corporation.",
    tags: ["firefox", "browser", "mozilla", "web", "internet"]
  },
  {
    title: "Python (3.12.3) - Windows 64-bit Installer",
    url: "https://www.python.org/ftp/python/3.12.3/python-3.12.3-amd64.exe",
    source: "Official Site",
    size: 25000000,
    type: "EXE",
    description: "Python is an interpreted, high-level and general-purpose programming language. Python's design philosophy emphasizes code readability with its notable use of significant whitespace.",
    tags: ["python", "py", "compiler", "interpreter", "language", "code"]
  },
  {
    title: "Node.js (20.12.2 LTS) - Windows 64-bit Installer",
    url: "https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi",
    source: "Official Site",
    size: 30000000,
    type: "MSI",
    description: "Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser.",
    tags: ["node", "nodejs", "js", "javascript", "npm", "server"]
  },
  {
    title: "Audacity (3.5.1) - Windows 64-bit Installer",
    url: "https://github.com/audacity/audacity/releases/download/Audacity-3.5.1/audacity-win-3.5.1-64bit.exe",
    source: "Official Site",
    size: 15000000,
    type: "EXE",
    description: "Audacity is an easy-to-use, multi-track audio editor and recorder for Windows, macOS, GNU/Linux and other operating systems.",
    tags: ["audacity", "audio", "sound", "editor", "music", "record", "wav", "mp3"]
  },
  {
    title: "GIMP (2.10.36) - Windows 64-bit Installer",
    url: "https://download.gimp.org/gimp/v2.10/windows/gimp-2.10.36-setup.exe",
    source: "Official Site",
    size: 310000000,
    type: "EXE",
    description: "GIMP is a cross-platform image editor available for GNU/Linux, macOS, Windows and more operating systems. It is free software, you can change its source code and distribute your changes.",
    tags: ["gimp", "image", "photo", "editor", "paint", "draw", "photoshop"]
  },
  {
    title: "Git for Windows (2.45.0) - 64-bit Installer",
    url: "https://github.com/git-for-windows/git/releases/download/v2.45.0.windows.1/Git-2.45.0-64-bit.exe",
    source: "Official Site",
    size: 60000000,
    type: "EXE",
    description: "Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
    tags: ["git", "version", "control", "github", "vcs"]
  },
  {
    title: "VS Code (1.89.0) - Windows 64-bit User Installer",
    url: "https://update.code.visualstudio.com/1.89.0/win32-x64-user/stable",
    source: "Official Site",
    size: 95000000,
    type: "EXE",
    description: "Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop and is available for Windows, macOS and Linux.",
    tags: ["vscode", "code", "visual", "studio", "editor", "editor"]
  }
];

async function search(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const software of localSoftware) {
    const matchesTitle = software.title.toLowerCase().includes(lowerQuery);
    const matchesTags = software.tags.some(tag => tag.includes(lowerQuery));

    if (matchesTitle || matchesTags) {
      results.push({
        title: software.title,
        url: software.url,
        source: software.source,
        size: software.size,
        type: software.type,
        description: software.description,
        date: new Date().toISOString()
      });
    }
  }

  return results.slice(0, 5);
}

module.exports = { search };
