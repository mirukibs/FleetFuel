const fs = require('fs');

const adminCode = fs.readFileSync('/home/mirukibs/Development/FleetFuel/Frontend/src/pages/Admin.jsx', 'utf8');
let fleetCompaniesCode = fs.readFileSync('/home/mirukibs/Development/FleetFuel/Frontend/src/pages/FleetCompanies.jsx', 'utf8');

// I will just use sed or standard text replacement directly via another file since it's a bit complex to merge them perfectly in an AST.
