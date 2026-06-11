const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (typeof search === 'string') {
            if (content.includes(search)) {
                content = content.split(search).join(replace);
                changed = true;
            }
        } else { // Regex
            if (search.test(content)) {
                content = content.replace(search, replace);
                changed = true;
            }
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

// 1. Update PHP Backend Files
walkDir(path.join(__dirname, 'Backend'), (filePath) => {
    if (!filePath.endsWith('.php')) return;
    replaceInFile(filePath, [
        ["Inertia::render('Modulos/modulo_inscripcion/Index'", "Inertia::render('Modulos/modulo_inscripcion/RegistroCUP/Index'"],
        ["Inertia::render('Modulos/usuario_seguridad/Login'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/Login'"],
        ["Inertia::render('Modulos/usuario_seguridad/Register'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/Register'"],
        ["Inertia::render('Modulos/usuario_seguridad/ForgotPassword'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/ForgotPassword'"],
        ["Inertia::render('Modulos/usuario_seguridad/ResetPassword'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/ResetPassword'"],
        ["Inertia::render('Modulos/usuario_seguridad/VerifyEmail'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/VerifyEmail'"],
        ["Inertia::render('Modulos/usuario_seguridad/ConfirmPassword'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/ConfirmPassword'"],
        ["Inertia::render('Modulos/usuario_seguridad/EnterToken'", "Inertia::render('Modulos/modulo_inscripcion/Autenticacion/EnterToken'"]
    ]);
});

replaceInFile(path.join(__dirname, 'routes', 'web.php'), [
    ["Inertia::render('Welcome'", "Inertia::render('Modulos/modulo_inscripcion/PaginaInicio/Index'"]
]);

// 2. Update React imports
walkDir(path.join(__dirname, 'resources', 'js', 'Front'), (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    replaceInFile(filePath, [
        [/from\s+['"]@\/Components\/Registro\/([^'"]+)['"]/g, "from './_components/$1'"], // Relative path inside RegistroCUP/Index.jsx
        // If a component outside RegistroCUP needs FormDatosPersonales, it will be broken, but it's only used in RegistroCUP/Index.jsx
        // Change route() calls for login/register if needed? Route names shouldn't change.
    ]);
});

// Clean up old dir if empty
try { fs.rmdirSync(path.join(__dirname, 'resources', 'js', 'Front', 'Components', 'Registro')); } catch(e) {}
