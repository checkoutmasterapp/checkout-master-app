exec("pwd", (error, stdout, stderr) => {
    if (error) {
        console.log(`custom_domain exec error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`custom_domain exec stderr: ${stderr}`);
        return;
    }
    console.log(`custom_domain exec stdout: ${stdout}`);
});


execFile(`${domian_sh}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`custom_domain execFile error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`custom_domain execFile stderr: ${stderr}`);
        return;
    }
    console.log(`custom_domain execFile stdout: ${stdout}`);
});

const child_process = spawn('bash', [`${domian_sh}`, domain_name], { cwd: __dirname });

// const child_process = spawn('df', ['-lh']);

child_process.stdout.on("data", (data) => {
    console.log(`custom_domain child.stdout data:${data}`)
});

child_process.stderr.on("data", (data) => {
    console.log(`custom_domain child.stderr data:${data}`)
});

child_process.on("error", (error) => {
    console.log(`custom_domain child.error:${error.message}`)
});

child_process.on("exit", (code, signal) => {
    if (code) console.log(`Process exit with code: ${code}`);
    if (signal) console.log(`Process exit with signal: ${signal}`);
    console.log("Done");
})