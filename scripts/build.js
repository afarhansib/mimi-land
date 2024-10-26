const fs = require('fs')
const archiver = require('archiver')
const path = require('path')

// Files/folders to exclude from production
const excludeList = [
    'tests',
    'dev_scripts',
    '.git',
    '.github',
    'node_modules',
    'package.json',
    'package-lock.json',

    'scripts/build.js',
    'scripts/bot.js',
    'scripts/net.js',
    'scripts/scriptevent.js',
    
    'dist',
    'TODO.md',
    'README.md',
    'index.html',
    'fiddle.js',
    '.vscode',
    'functions',
    'structures',
    '.gitignore',
    'LICENSE',
]

function getTimestamp() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
}

function toIsoStringWTZ(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            return (num < 10 ? '0' : '') + num;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}

function cleanManifest(content) {
    const manifest = JSON.parse(content)

    manifest.header.description = manifest.header.description + "\nBuilt at " + toIsoStringWTZ(new Date())
    // manifest.header.description = `${manifest.header.description} Built at ${getTimestamp()}`
    const devDependencies = ['@minecraft/server-net', '@minecraft/server-gametest']
    manifest.dependencies = manifest.dependencies.filter(dep => 
        !devDependencies.includes(dep.module_name)
    )
    return JSON.stringify(manifest, null, 2)
}

function cleanJavaScript(content) {
    return content
        // Remove dev blocks
        .replace(/\/\/ @dev-start[\s\S]*?\/\/ @dev-end\n?/g, '')
        // Remove single line comments more effectively
        .replace(/\/\/[^\n]*\n/g, '\n')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Clean multiple blank lines
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Remove trailing whitespace
        .replace(/[ \t]+$/gm, '')
        // Remove blank lines at start
        .replace(/^\s+/, '')
        // Remove blank lines at end
        .replace(/\s+$/, '\n')
}


const filesToModify = {
    'manifest.json': cleanManifest,
    '*': (content, filename) => {
        if (filename.endsWith('.js')) {
            return cleanJavaScript(content)
        }
        return content
    }
}

function copyFiles(destDir) {
    fs.readdirSync('.').forEach(file => {
        if (!excludeList.includes(file)) {
            const destPath = path.join(destDir, file)
            if (fs.lstatSync(file).isDirectory()) {
                // For directories, check files inside before copying
                fs.mkdirSync(destPath, { recursive: true })
                const files = fs.readdirSync(file)
                files.forEach(subFile => {
                    const fullPath = `${file}/${subFile}`
                    if (!excludeList.includes(fullPath)) {
                        const subDestPath = path.join(destPath, subFile)
                        if (fs.lstatSync(fullPath).isDirectory()) {
                            fs.cpSync(fullPath, subDestPath, { recursive: true })
                        } else if (fullPath.endsWith('.js')) {
                            const content = fs.readFileSync(fullPath, 'utf8')
                            const modifiedContent = cleanJavaScript(content)
                            fs.writeFileSync(subDestPath, modifiedContent)
                        } else {
                            fs.copyFileSync(fullPath, subDestPath)
                        }
                    }
                })
            } else if (file.endsWith('.js')) {
                const content = fs.readFileSync(file, 'utf8')
                const modifiedContent = cleanJavaScript(content)
                fs.writeFileSync(destPath, modifiedContent)
            } else if (filesToModify[file]) {
                const content = fs.readFileSync(file, 'utf8')
                const modifiedContent = filesToModify[file](content)
                fs.writeFileSync(destPath, modifiedContent)
            } else {
                fs.copyFileSync(file, destPath)
            }
        }
    })
}



function createBuild() {
    const timestamp = getTimestamp()
    const buildDir = `dist/mimi-land_${timestamp}`
    const archivePath = `${buildDir}.mcpack`

    // Create build directory
    fs.mkdirSync(buildDir, { recursive: true })

    // Copy and modify files
    copyFiles(buildDir)

    // Create archive
    const output = fs.createWriteStream(archivePath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
        console.log(`Build completed:
- Production folder: ${buildDir}
- Archive: ${archivePath}`)
    })

    archive.pipe(output)
    archive.directory(buildDir, false)
    archive.finalize()
}

// Create dist directory
fs.mkdirSync('dist', { recursive: true })
createBuild()
