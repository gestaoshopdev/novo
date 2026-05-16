import { z } from "zod";

const schema = z.string().url();

try {
  schema.parse("http://localhost:5173/payment-callback?plan=elite");
  console.log("VALID!");
} catch (e) {
  console.log("INVALID!");
  console.log(e);
}
