import { Command } from "@oclif/command";
import * as inquirer from "inquirer";
import * as fuzzy from "fuzzy";
import * as lodash from "lodash";
import { parseString } from "xml2js";
import Parameter from "../utilities/parameter";
import ChoiceParameter from "../utilities/choice_parameter";
import StringParameter from "../utilities/string_parameter";
import cli from "cli-ux";
import JenkinsHelper from "../utilities/jenkins_helper";

let jenkins_helper: JenkinsHelper;

let jobs_name_list: any;

export const FILTER_NAME = "name";
export const FILTER_CLASS = "_class";
export const FILTER_URL = "url";
export const FILTER_COLOR = "color";

export default class Run extends Command {
  static description = "Run the intended job";

  async run() {
    let jenkins_server: any;
    try {
      jenkins_helper = new JenkinsHelper();
      jenkins_server = await jenkins_helper.get_server_selection_from_user(
        this.config.configDir,
        "config.json"
      );
      cli.action.start("Connecting to Jenkins server");
      jenkins_helper.create_jenkinsapi_object(jenkins_server);
      jobs_name_list = await jenkins_helper.get_job_list(FILTER_NAME);
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

    const selected_job = await getUserSelectedJob();

    cli.action.start("Fetching job configuration from the server");
    const xml_job_config = await jenkins_helper.get_job_config(selected_job);
    const json_job_config = await xml2jsonObj(xml_job_config as string);
    cli.action.stop();

    const parameters = await get_parameters_from_json_job_config(
      json_job_config as JSON
    );

    const enable_logs: boolean = await get_enable_logs_from_user();

    cli.action.start("Triggering build");
    const queue_item_number: number = (await jenkins_helper.trigger_build(
      selected_job,
      parameters
    )) as number;
    cli.action.stop();

    cli.action.start("Waiting for Jenkins server to start the build");
    let build_number: number | undefined;
    jenkins_helper
      .get_build_num_from_queue_item_number(queue_item_number, 5000, 60)
      .then((build_num) => {
        build_number = build_num as number;
      })
      .catch((err) => {
        throw new Error(`Build did not start: ${err}`);
      });
    cli.action.stop(
      `Done
        Build number: ${build_number}
        `
    );
    if (enable_logs) {
      jenkins_helper.stream_logs(selected_job, build_number as number);
    }
  }
}

async function getUserSelectedJob() {
  inquirer.registerPrompt(
    "autocomplete",
    require("inquirer-autocomplete-prompt")
  );

  let responses: any = await inquirer.prompt([
    {
      name: "selected_job",
      message: "Which job do you want to run?",
      type: "autocomplete",
      source: searchJobs,
    },
  ]);
  return responses.selected_job;
}

async function xml2jsonObj(xml: string) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, results) => {
      if (err) {
        reject(err);
      }
      resolve(results);
    });
  });
}

function searchJobs(answers: Array<string>, input: string) {
  input = input || "";
  return new Promise(function (resolve) {
    setTimeout(function () {
      var fuzzyResult = fuzzy.filter(input, jobs_name_list);
      const results = fuzzyResult.map(function (el) {
        return el.original;
      });

      results.splice(5, 0, new inquirer.Separator());
      results.push(new inquirer.Separator());
      resolve(results);
    }, lodash.random(30, 500));
  });
}

async function get_parameters_from_json_job_config(json_job_config: JSON) {
  let parameter_object_list: Array<Parameter> = new Array();
  const param_definitions = (json_job_config as any).project.properties[0][
    "hudson.model.ParametersDefinitionProperty"
  ][0]["parameterDefinitions"][0];

  for (const [parameter_class, parameter_local_list] of Object.entries(
    param_definitions
  )) {
    for (const parameter of parameter_local_list as Array<object>) {
      let param: Parameter | undefined;
      if (parameter_class.includes("StringParameterDefinition")) {
        // This is a StringParameter
        param = new StringParameter(
          (parameter as any).name[0],
          (parameter as any).description[0],
          (parameter as any).defaultValue[0]
        );
      } else if (parameter_class.includes("ChoiceParameterDefinition")) {
        // This is a ChoiceParameter
        param = new ChoiceParameter(
          (parameter as any).name[0],
          (parameter as any).description[0],
          Object.values((parameter as any).choices[0]["a"][0]["string"])
        );
      }
      if (param) {
        await param.getParamterValuesFromUser();
        parameter_object_list.push(param);
      }
    }
  }
  let parameters: any = {};
  for (const parameter_object of parameter_object_list) {
    parameters[parameter_object.name] = parameter_object.value;
  }
  return parameters;
}

async function get_enable_logs_from_user(): Promise<boolean> {
  let responses: any = await inquirer.prompt([
    {
      name: "enable_logs",
      message: "Enable synchronous logs?",
      type: "confirm",
      default: true,
    },
  ]);
  return responses.enable_logs;
}
// TODO: Add notifier
