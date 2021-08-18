import { Command } from "@oclif/command";
import * as fs from "fs-extra";
import * as path from "path";
import * as inquirer from "inquirer";

export default class Config extends Command {
  static description = "CLI configurations";

  config_file_name = "config.json";

  async run() {
    try {
      let servers: Array<object> = new Array();
      do {
        const name: string = await this.getServerName();
        const url: string = await this.getURL();
        const username: string = await this.getUsername();
        const secret: string = await this.getSecret();
        servers.push({ name, url, username, secret });
      } while (await this.getAnotherServerConfigurationNeeded());

      await fs.outputJSON(
        path.join(this.config.configDir, "config.json"),
        servers
      );
    } catch (err) {
      console.error("err");
    }
  }

  async getAnotherServerConfigurationNeeded() {
    let responses: any = await inquirer.prompt([
      {
        name: "needed",
        message: "Do you want to configure another server?",
        type: "confirm",
        default: false,
      },
    ]);
    return responses.needed;
  }
  async getServerName() {
    let name: string;
    let responses: any = await inquirer.prompt([
      {
        name: "name",
        message: "Name of Jenkins server? eg: CI/Build-ops",
        type: "input",
      },
    ]);
    name = responses.name;
    return name;
  }
  async getURL() {
    let url: string;
    let responses: any = await inquirer.prompt([
      {
        name: "url",
        message:
          "URL of Jenkins server? (Enter without http or slashes) eg: ci.turvo.net:8080",
        type: "input",
      },
    ]);
    url = responses.url;
    return url;
  }
  async getUsername() {
    let username: string;
    let responses: any = await inquirer.prompt([
      {
        name: "username",
        message: "Username? (Eg: akshay.m)",
        type: "input",
      },
    ]);
    username = responses.username;
    return username;
  }
  async getSecret() {
    let secret: string;
    let responses: any = await inquirer.prompt([
      {
        name: "secret",
        message: "API token / Password?",
        type: "password",
        mask: "*",
      },
    ]);
    secret = responses.secret;
    return secret;
  }
}
