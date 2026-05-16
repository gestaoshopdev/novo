async function checkRPC() {
  const url = "https://ylsdljylqbnuajjyipwy.supabase.co/rest/v1/?apikey=sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
  const res = await fetch(url);
  const data = await res.json();
  const paths = Object.keys(data.paths).filter((p: string) => p.startsWith('/rpc/'));
  console.log("Available RPCs:", paths);
}

checkRPC();
