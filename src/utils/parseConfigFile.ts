// Used for configuration on deploy guide page
import { z } from "zod";
import {
  Schema_Config,
  Schema_Config_API,
  Schema_Config_Site,
  Schema_Old_Config,
} from "~/schema";

export function parseConfigFile(config: string):
  | {
      api: z.infer<typeof Schema_Config_API>;
      site: z.infer<typeof Schema_Config_Site>;
    }
  | {
      success: false;
      message: string;
    } {
  try {
    // Parse string to JSON
    const configuration = config
      .split(/const config:\s.*?=\s/g)[1]
      .split("export default config;")[0]
      .replace(/\\/g, "") // Remove all escape backslashes

      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove all multi-line comments
      .replace(/,\s\/\/\s.*/g, ",") // Remove comments after values
      .replace(/[^,]\/\/\s.*?,/g, "") // Remove single line comments

      .replace(/\r\n/g, "")
      .replace(/\n/g, "")
      .replace(/\t/g, "") // Remove line breaks and tabs

      .replace(/basePath:(.*?),/g, 'basePath: "placeholder-domain",') // Replace basePath variable with placeholder
      .replace(/maxFileSize:(.*?),/g, "maxFileSize: 4194304,") // Set maxFileSize to 4MB

      .replace(/([a-zA-Z]*?):\s/g, '"$1": ') // Add double quotes to keys
      .trim()
      .slice(0, -1)

      .replace(/\s{2,4}|/g, "") // Replace all double+ spaces with single space
      .replace(/,(?=[^,]*$)/, "") // Remove trailing comma
      .replace(/(,\])/g, "]") // Remove trailing comma before closing bracket
      .replace(/(,\})/g, "}"); // Remove trailing comma before closing brace

    const parseJSON = JSON.parse(configuration);
    const version: string | undefined = parseJSON.version;
    if (!version)
      throw new Error(
        "Version not found, please check your configuration file.",
      );

    const data = parseJSON as
      | z.infer<typeof Schema_Old_Config>
      | z.infer<typeof Schema_Config>;

    return {
      api: data.apiConfig as z.infer<typeof Schema_Config_API>,
      site: data.siteConfig as z.infer<typeof Schema_Config_Site>,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, message: e.message };
  }
}
