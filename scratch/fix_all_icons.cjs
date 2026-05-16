const fs = require('fs');
const file = 'src/routes/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = '<img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Minha Loja" className="w-full h-full object-cover" />';
const newStr = '<img src={Icon} alt="Minha Loja" className="w-full h-full object-contain p-1.5 bg-white drop-shadow-sm" />';

if (content.includes(oldStr)) {
  content = content.split(oldStr).join(newStr); // replace all
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Not found");
}
