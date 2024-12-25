const fs = require('fs');
const path = require('path');

// Ruta del archivo roles.json
const rolesFilePath = path.join(__dirname, 'roles.json');

// Verifica si roles.json existe
if (!fs.existsSync(rolesFilePath)) {
    // Si no existe, crea el archivo con un rol predeterminado
    fs.writeFileSync(rolesFilePath, JSON.stringify({ "5213339992782": "owner" }, null, 2));
    console.log("Archivo roles.json creado con el rol de owner.");
}

// Función para cargar roles desde el archivo roles.json
function getRoles() {
    if (fs.existsSync(rolesFilePath)) {
        return JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));
    }
    return {};
}

// Función para guardar roles en el archivo roles.json
function saveRoles(roles) {
    fs.writeFileSync(rolesFilePath, JSON.stringify(roles, null, 2));
}

// Exportar las funciones
module.exports = { getRoles, saveRoles };