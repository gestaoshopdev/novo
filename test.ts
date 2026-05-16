import { AbacatePay } from '@abacatepay/sdk'; 
const client = AbacatePay({secret: 'fake'}); 
type Res = Awaited<ReturnType<typeof client.checkouts.create>>; 
const x: Res = null as any; 
console.log(x.url); 
console.log(x.data.url);
