import fs from "node:fs";
import path from "node:path";
import cp from "node:child_process";
import esbuild from "esbuild";

import { globSync as glob } from "glob";
import packageJson from "./package.json" with { type: "json" };

const NPM_ARGS = process.argv.slice(2);
const SRC_FILES = glob("./src/**/*.ts");
const BUILD_DIR = path.resolve("build");
const NPM_IGNORE = [".*", "*.tgz", "node_modules", "package-lock.json"];
const BUNDLE_NAME = `${packageJson.name}.min.js`;

/** Builds */
function build() {
  // node
  for (const format of ["esm", "cjs"]) {
    esbuild.buildSync({
      entryPoints: SRC_FILES,
      outdir: path.join(BUILD_DIR, format),
      format: format,
      platform: "node",
      treeShaking: true
    });
  }

  // bundle
  esbuild.buildSync({
    globalName: packageJson.name,
    entryPoints: ["./src/index.ts"],
    outfile: path.join(BUILD_DIR, "dist", BUNDLE_NAME),
    platform: "browser",
    minify: true,
    bundle: true
  });
}

/**
 * Create module in BUILD_DIR
 */
function createModule() {
  console.log("Creating module at " + BUILD_DIR);

  // ensure directory exists
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR);

  // write ignore file
  fs.writeFileSync(path.join(BUILD_DIR, ".npmignore"), NPM_IGNORE.join("\n"));

  // copy all files listed in package.json
  packageJson.files.forEach(f => {
    if (fs.existsSync(f) && fs.lstatSync(f).isFile()) {
      fs.copyFileSync(path.resolve(f), path.join(BUILD_DIR, f));
    }
  });

  // clear all dev config
  ["scripts", "devDependencies", "lint-staged"].forEach(
    k => delete packageJson[k]
  );

  // add exports explicitly
  packageJson.exports = {
    "./package.json": "./package.json"
  };
  packageJson.sideEffects = ["./cjs/init/system.js", "./esm/init/system.js"];
  packageJson.browser = BUNDLE_NAME;

  // configure aliases for all exports
  SRC_FILES.filter(s => !s.includes("_")).forEach(s => {
    // strip "src/" (prefix) and ".ts" (suffix)
    s = s.slice(4, -3);
    const isRoot = s === "index";
    const isLeaf = !s.endsWith("/index");
    const name = isRoot ? "." : isLeaf ? s : s.slice(0, -6);
    const outFile = isRoot ? "index" : s;
    const key = isRoot ? "." : "./" + name;
    // exclude distinct operator functions
    if (isLeaf && name.includes("operators")) return;
    // create distributions
    const typesPath = `./types/${outFile}.d.ts`;
    const cjsPath = `./cjs/${outFile}.js`;
    const esmPath = `./esm/${outFile}.js`;

    packageJson.exports[key] = {
      types: typesPath,
      node: cjsPath,
      default: esmPath
    };
  });

  const data = JSON.stringify(packageJson, null, 2);

  // write new package.json for lib
  fs.writeFileSync(path.join(BUILD_DIR, "package.json"), data);
}

function copyDemoHtml() {
  // read file
  const demoHtml = "demo.html";
  let content = fs.readFileSync(demoHtml, "utf8");

  // replace local distribution
  content = content.replace(
    "./build/dist/mingo.min.js",
    `https://unpkg.com/mingo@${packageJson.version}/dist/mingo.min.js`
  );

  // write to new location
  fs.writeFileSync("docs/" + demoHtml, content, "utf8");
}

function main() {
  build();
  createModule();
  copyDemoHtml();

  if (NPM_ARGS.length) {
    // execute within lib dir
    console.log("\nExecuting command:", `npm ${NPM_ARGS.join(" ")}`, "\n");

    // execute command
    cp.spawnSync("npm", NPM_ARGS, {
      cwd: BUILD_DIR,
      env: process.env,
      stdio: "inherit"
    });

    console.log("\nCompleted command\n");

    // if we created a tar file, copy to parent directory
    let tarball = packageJson.name + "-" + packageJson.version + ".tgz";
    let tarballPath = path.join(BUILD_DIR, tarball);
    if (fs.existsSync(tarballPath)) {
      console.log("Copying", tarball, "to correct folder");
      fs.renameSync(tarballPath, path.join(path.dirname(BUILD_DIR), tarball));
    }
  }
}

main();
