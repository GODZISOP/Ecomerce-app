const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'medicines_with_images.csv');
const sqlPath = path.join(__dirname, 'insert_medicines.sql');

const csvData = fs.readFileSync(csvPath, 'utf8');

// Parse CSV manually, taking care of quoted values
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = [];
        let insideQuote = false;
        let entry = '';
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                row.push(entry.trim());
                entry = '';
            } else {
                entry += char;
            }
        }
        row.push(entry.trim());
        result.push(row);
    }
    return result;
}

const rows = parseCSV(csvData);
let sql = 'INSERT INTO public.medicines (id, name, generic_name, category, price_pkr, stock, dosage, description, manufacturer, requires_prescription, image_url) VALUES\n';

const valueLines = rows.map(row => {
    if (row.length < 11) {
        console.warn('Skipping invalid row:', row);
        return null;
    }
    
    const id = parseInt(row[0]);
    const name = row[1].replace(/'/g, "''");
    const generic_name = row[2].replace(/'/g, "''");
    const category = row[3].replace(/'/g, "''");
    const price_pkr = parseInt(row[4]);
    const stock = parseInt(row[5]);
    const dosage = row[6].replace(/'/g, "''");
    const description = row[7].replace(/'/g, "''");
    const manufacturer = row[8].replace(/'/g, "''");
    const requires_prescription = row[9].toLowerCase() === 'yes';
    const image_url = row[10].replace(/'/g, "''");
    
    return `(${id}, '${name}', '${generic_name}', '${category}', ${price_pkr}, ${stock}, '${dosage}', '${description}', '${manufacturer}', ${requires_prescription}, '${image_url}')`;
}).filter(Boolean);

sql += valueLines.join(',\n') + ';\n';

fs.writeFileSync(sqlPath, sql, 'utf8');
console.log('Successfully generated SQL file with', valueLines.length, 'records.');
