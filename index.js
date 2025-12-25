import express from "express";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(express.json());

// تنظیمات
const RPC = "https://mainnet.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY; // کلید خصوصی Rabby Wallet
const TOKEN_ADDRESS = "0xfCa3Ec03F9Ea17962f6981833b54C32C53E0Bffe";

const ABI = [
  "function transfer(address to, uint amount) returns (bool)"
];

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const token = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet);

const played = {}; // محدودیت روزانه

app.post("/play", async (req, res) => {
  const { fid, wallet: userWallet, guess } = req.body;
  const today = new Date().toDateString();

  if (played[fid] === today) {
    return res.json({ error: "امروز بازی کردی" });
  }

  played[fid] = today;
  const result = Math.random() < 0.5 ? "shir" : "khat";

  if (guess === result) {
    await token.transfer(userWallet, ethers.parseUnits("10", 18));
    return res.json({ win: true, result });
  }

  res.json({ win: false, result });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
