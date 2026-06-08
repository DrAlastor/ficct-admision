const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Backend', 'Modulo1_Seguridad', 'Controllers');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/'Auth\/Login'/g, "'Modulos/usuario_seguridad/Login'");
    content = content.replace(/'Auth\/Register'/g, "'Modulos/usuario_seguridad/Register'");
    content = content.replace(/'Auth\/ForgotPassword'/g, "'Modulos/usuario_seguridad/ForgotPassword'");
    content = content.replace(/'Auth\/EnterToken'/g, "'Modulos/usuario_seguridad/EnterToken'");
    content = content.replace(/'Auth\/ResetPassword'/g, "'Modulos/usuario_seguridad/ResetPassword'");
    content = content.replace(/'Auth\/VerifyEmail'/g, "'Modulos/usuario_seguridad/VerifyEmail'");
    content = content.replace(/'Auth\/ConfirmPassword'/g, "'Modulos/usuario_seguridad/ConfirmPassword'");
    content = content.replace(/'Profile\/Edit'/g, "'Modulos/usuario_seguridad/Edit'");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.php')) {
            replaceInFile(fullPath);
        }
    });
}

traverse(dir);
console.log('Done');
