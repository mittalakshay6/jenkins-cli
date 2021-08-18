import { Command } from "@oclif/command";
import JenkinsHelper from "../utilities/jenkins_helper";
import * as inquirer from "inquirer";
import cli from "cli-ux";
import { FILTER_NAME } from "./run";

let jenkins_helper: JenkinsHelper;

export default class Logs extends Command {
  static description = "View logs by build number";

  async run() {
    let job_name: string;
    let build_number: number;
    let jenkins_server: any;
    try {
      jenkins_helper = new JenkinsHelper();
      jenkins_server = await jenkins_helper.get_server_selection_from_user(
        this.config.configDir,
        "config.json"
      );
      cli.action.start("Connecting to Jenkins server");
      jenkins_helper.create_jenkinsapi_object(jenkins_server);
      await jenkins_helper.get_job_list(FILTER_NAME);
      cli.action.stop();
    } catch (err) {
      cli.action.stop("Failed");
      throw new Error(
        `Invalid configuration found.
        Username: ${jenkins_server?.username}
        URL: ${jenkins_server?.url}
        Secret: <hidden>
        Please, re-configure with "config" cli`
      );
    }
    let responses: any = await inquirer.prompt([
      {
        name: "job_name",
        message: "Job name?",
        type: "input",
      },
      {
        name: "build_number",
        message: "Build number?",
        type: "input",
        validate: (input) => {
          if (isNaN(input)) {
            return `Invalid input, hit backspace/delete and enter a valid number`;
          } else return true;
        },
      },
    ]);
    build_number = responses.build_number;
    job_name = responses.job_name;
    jenkins_helper.stream_logs(job_name, build_number);
  }
}
