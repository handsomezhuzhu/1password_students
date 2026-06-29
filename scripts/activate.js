#!/usr/bin/env node

const readline = require("readline");

const API_BASE = "https://start.b5dev.eu";
const DOMAIN = "1password.com";

const colors = {
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

function color(name, text) {
  return `${colors[name]}${text}${colors.reset}`;
}

function extractCode(input) {
  const text = String(input || "").trim();
  if (!text) return "";

  try {
    const url = new URL(text);
    const code = url.searchParams.get("code");
    if (code) return code;
  } catch (_) {
    // Not a full URL; fall back to regex/plain code parsing.
  }

  const match = text.match(/[?&]code=([^&\s]+)/);
  if (match) return decodeURIComponent(match[1]);

  if (/^[a-zA-Z0-9._~-]{8,}$/.test(text)) return text;
  return "";
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

async function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function printLinks(token) {
  const groups = [
    {
      title: "b5dev 域",
      regions: [
        ["全球", "https://start.b5dev.com"],
        ["欧洲", "https://start.b5dev.eu"],
      ],
    },
    {
      title: "1password 域",
      regions: [
        ["全球", "https://start.1password.com"],
        ["欧洲", "https://start.1password.eu"],
      ],
    },
  ];

  console.log(color("yellow", "=================================================="));
  for (const group of groups) {
    console.log(color("bold", `【${group.title}】`));
    for (const [region, base] of group.regions) {
      console.log(color("bold", `【${region}】`));
      console.log(color("bold", "【新用户注册链接】"));
      console.log(`${base}/sign-up?c=${token}`);
      console.log(color("bold", "【老用户登录链接】"));
      console.log(`${base}/partnership/link?c=${token}\n`);
    }
  }
  console.log(color("yellow", "=================================================="));
}

async function main() {
  if (typeof fetch !== "function") {
    throw new Error("当前 Node.js 版本不支持 fetch。请安装 Node.js 18 或更高版本。");
  }

  console.log(color("cyan", "========================================"));
  console.log(color("cyan", "   1Password 学生优惠激活调试工具"));
  console.log(color("cyan", "========================================\n"));

  const argInput = process.argv.slice(2).join(" ").trim();
  const fullInput = argInput || await ask(color("yellow", "请粘贴完整的跳转 URL: "));
  const code = extractCode(fullInput);

  if (!code) throw new Error("未能识别 code。请粘贴完整跳转 URL，或直接粘贴 code。");
  console.log(`\n${color("green", "[1/3] 提取到 Code:")} ${code}`);

  console.log(`\n${color("blue", "[2/3] 正在请求 Student Token...")}`);
  const res1 = await fetch(`${API_BASE}/api/v3/github-student/${encodeURIComponent(code)}`);
  const data1 = await readJson(res1);

  console.log(color("bold", "--- 服务器返回的完整 Student 数据 ---"));
  console.log(JSON.stringify(data1, null, 4));
  console.log(color("bold", "------------------------------------"));

  if (!res1.ok || !data1.studentToken) {
    throw new Error(`获取 Student Token 失败 (HTTP ${res1.status}): ${JSON.stringify(data1)}`);
  }

  console.log(`\n${color("blue", "[3/3] 正在请求 Activation Token...")}`);
  const res2 = await fetch(`${API_BASE}/api/v3/github-student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentToken: data1.studentToken,
      domain: DOMAIN,
    }),
  });
  const data2 = await readJson(res2);

  console.log(color("bold", "--- 服务器返回的完整 Activation 数据 ---"));
  console.log(JSON.stringify(data2, null, 4));
  console.log(color("bold", "--------------------------------------"));

  if (!res2.ok || !data2.activationToken) {
    throw new Error(`激活失败 (HTTP ${res2.status}): ${JSON.stringify(data2)}`);
  }

  console.log(`\n${color("green", "流程全部成功！")}`);
  printLinks(data2.activationToken);
}

main().catch((error) => {
  console.error(`\n${color("red", "致命错误:")} ${error.message}`);
  process.exitCode = 1;
});
