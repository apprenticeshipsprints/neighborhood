#!/usr/bin/env node

const { promisify } = require("util");
const fs = require("fs");
const mkdtemp = promisify(fs.mkdtemp);
const path = require("path");
const os = require("os");
const shell = require("shelljs");

(async function() {
  function lintFile(tempDir, args, file) {
    const out = path.join(tempDir, file);
    shell.mkdir("-p", path.dirname(out));
    shell.sed(/<%.+%>/, "", file).to(out);
    const result = shell.exec(`node_modules/.bin/htmlhint ${args} --config=.htmlhintrc ${out}`);
    return result.code;
  }

  let result = 0;
  if (process.argv.length > 2) {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "lint-html-"));
    const htmlHintArgs = process.argv.slice(2, -1).join(" ");
    const files = process.argv[process.argv.length - 1];
    const results = shell.ls(files).map(lintFile.bind(null, tempDir, htmlHintArgs));
    result = results.reduce((a, r) => a + r, 0);
    shell.rm("-r", tempDir);
  }

  shell.exit(result);
})();
