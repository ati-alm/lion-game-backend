import express from "express";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(express.json());

// تنظیمات
const RPC = "https://mainnet.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY; // حتماً تنظیم شود
const TOKEN_ADDRESS = "0xfCa3Ec03F9Ea17962f6981833b54C32C53E0Bffe";
const ABI = ["function transfer(address to, uint amount) returns (bool)"];

const provider = new ethers.JsonRpcProvider(RPC);
let wallet, token;

if(PRIVATE_KEY){
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  token = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet);
} else {
  console.warn("PRIVATE_KEY تنظیم نشده! انتقال توکن غیرفعال است.");
}

const played = {}; // محدودیت روزانه

app.post("/play", async (req, res) => {
  try {
    const { fid, wallet: userWallet, guess } = req.body;
    const today = new Date().toDateString();

    if (!fid || !userWallet || !guess) {
      return res.status(400).json({ error: "اطلاعات ناقص" });
    }

    if (played[fid] === today) {
      return res.json({ error: "امروز بازی کردی" });
    }

    played[fid] = today;
    const result = Math.random() < 0.5 ? "shir" : "khat";

    if (guess === result) {
      // انتقال توکن فقط اگر PRIVATE_KEY موجود باشد
      if(wallet && token){
        try{
          await token.transfer(userWallet, ethers.parseUnits("10", 18));
        } catch(e){
          console.error("خطا در انتقال توکن:", e);
        }
      }
      return res.json({ win: true, result });
    }

    res.json({ win: false, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای سرور" });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
