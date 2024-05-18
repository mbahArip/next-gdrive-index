export const migration = `If you've already deployed the app before and want to upgrade from v1, you can follow this guide to migrate the app to the latest version.

### Update your environment and configuration

If you still have the \`.env.local file\`, you can go to the [configuration](#config) section, and load the file to update the environment variables.
If you don't have it, go to your deployment platform and copy the environment variables from the platform to the [configuration](#config) section.

You can also load the old \`gindex.config.ts\` file to the [configuration](#config) section to set the default configuration.

### Update the repository

First, you need to update the repository to the latest version.
If you open your forked repository, you will see a notification that the repository is behind the original repository.
You can sync the repository by clicking the \`Sync fork\` button.
After the repository is updated, you can replace the \`gindex.config.ts\` file with the new one.

### Update deployment

Now go to your Vercel project page (or other platforms).
Go to the \`Settings\` tab, and click the \`Environment Variables\` menu.
You can delete all the old environment variables, and copy the new environment variables from the updated \`.env.local\` file.
Now you can redeploy the app to apply the changes.`;
