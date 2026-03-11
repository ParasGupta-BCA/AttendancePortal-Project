const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

walk('src/app/api/tuition').forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Switch database connection
    content = content.replace(/import \{ query \} from "@\/lib\/db";/g, 'import { tenantQuery as query } from "@/lib/db-tenant";');
    content = content.replace(/import \{ query \} from "\.\.\/\.\.\/\.\.\/lib\/db";/g, 'import { tenantQuery as query } from "@/lib/db-tenant";');
    content = content.replace(/import \{ query \} from '\.\.\/\.\.\/\.\.\/lib\/db';/g, 'import { tenantQuery as query } from "@/lib/db-tenant";');
    
    // Switch authentication gate
    content = content.replace(/session\.user\.role !== "admin"/g, '!session.user.is_tuition_user');
    content = content.replace(/session\.user\.role !== 'admin'/g, '!session.user.is_tuition_user');
    
    fs.writeFileSync(f, content);
});
console.log('API import replacement complete!');
