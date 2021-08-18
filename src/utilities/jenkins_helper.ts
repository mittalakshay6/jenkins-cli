import * as jenkinsapi from "jenkins";
import * as fs from "fs-extra";
import * as path from "path";
import * as inquirer from "inquirer";
import { filter_data } from "./misc";

export default class JenkinsHelper {
  jenkins_server: object | undefined;
  jenkins: jenkinsapi.JenkinsAPI | undefined;

  stream_logs(job_name: string, build_number: number) {
    const log = this.jenkins?.build.logStream(job_name, build_number);

    log?.on("data", function (text) {
      process.stdout.write(text);
    });

    log?.on("error", function () {
      console.error("Job not found");
    });
  }

  stop_build(job_name: string, build_number: number) {
    this.jenkins?.build.stop(job_name, build_number, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  async get_server_selection_from_user(
    config_file_path: string,
    file_name: string
  ) {
    const servers: Array<any> = await fs.readJSON(
      path.join(config_file_path, file_name)
    );
    let responses = await inquirer.prompt({
      name: "server_name",
      message: "Select Jenkins server",
      type: "list",
      choices: servers.map((server) => server.name),
    });
    this.jenkins_server = servers.find(
      (server) => server.name === responses.server_name
    );
    return this.jenkins_server;
  }

  create_jenkinsapi_object(jenkins_server: any) {
    this.jenkins = jenkinsapi({
      baseUrl: `http://${jenkins_server.username}:${jenkins_server.secret}@${jenkins_server.url}`,
      crumbIssuer: false,
    });
    return this.jenkins;
  }

  async get_job_config(job_name: string) {
    return new Promise((resolve, reject) => {
      this.jenkins?.job.config(job_name, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async get_job_list(filter = "") {
    return new Promise((resolve, reject) => {
      this.jenkins?.job.list((err, data) => {
        if (err) {
          reject(err);
        } else {
          if (filter !== "") {
            data = filter_data(data as Array<object>, filter as keyof object);
          }
          resolve(data);
        }
      });
    });
  }

  async trigger_build(job_name: string, parameters: object) {
    return new Promise((resolve, reject) => {
      this.jenkins?.job.build(
        { name: job_name, parameters: parameters },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  async get_queue_item_info(queue_item_number: number) {
    return new Promise((resolve, reject) => {
      this.jenkins?.queue.item(queue_item_number, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async get_build_num_from_queue_item_number(
    queue_item_number: number,
    interval: number,
    maxAttempts: number
  ) {
    let attempts = 0;
    const executePoll = async (resolve: any, reject: any) => {
      const queue_item_info: any = await this.get_queue_item_info(
        queue_item_number
      );
      attempts++;
      if (queue_item_info["executable"]) {
        return resolve(queue_item_info["executable"]["number"]);
      } else if (maxAttempts && attempts === maxAttempts) {
        return reject(new Error("Exceeded max attempts"));
      } else {
        setTimeout(executePoll, interval, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }
}
