const { exec } = require("child_process");

module.exports = {
  name: 'TEST',
  description: 'this should send a message containing an output from the command line... :)',
  async execute(message, Discord, client, con, arguments) {

    exec("exec.bat python test.bat " + arguments.version, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
};
