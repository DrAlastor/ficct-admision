const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Backend', 'Modulo1_Seguridad', 'Controllers');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/'Auth\/Login'/g, "'Modulos/Modulo1_Seguridad/Login'");
    content = content.replace(/'Auth\/Register'/g, "'Modulos/Modulo1_Seguridad/Register'");
    content = content.replace(/'Auth\/ForgotPassword'/g, "'Modulos/Modulo1_Seguridad/ForgotPassword'");
    content = content.replace(/'Auth\/EnterToken'/g, "'Modulos/Modulo1_Seguridad/EnterToken'");
    content = content.replace(/'Auth\/ResetPassword'/g, "'Modulos/Modulo1_Seguridad/ResetPassword'");
    content = content.replace(/'Auth\/VerifyEmail'/g, "'Modulos/Modulo1_Seguridad/VerifyEmail'");
    content = content.replace(/'Auth\/ConfirmPassword'/g, "'Modulos/Modulo1_Seguridad/ConfirmPassword'");
    content = content.replace(/'Profile\/Edit'/g, "'Modulos/Modulo1_Seguridad/Edit'");

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
