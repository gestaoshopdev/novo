const fs = require('fs');
const file = 'src/routes/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = '<img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=100&auto=format&fit=crop" alt="Minha Loja" className="w-full h-full object-cover" />';
const newStr = '<img src={Icon} alt="Minha Loja" className="w-full h-full object-contain p-1.5 bg-white drop-shadow-sm" />';

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Not found");
}
