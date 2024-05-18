export const shared_drive = `I'm separating this guide in case someone who already using v1 can see this guide easily.

As of version 2.0.2 we added support for Shared Drive, and the demo actually using a Shared Drive.
You can follow this guide to use Shared Drive as the root folder for the application.

1. Go to [Google Drive](https://drive.google.com/)
2. Open the \`Shared Drives\` menu from the sidebar
3. Right click on the Shared Drive you want to use, and choose \`Manage members\`
4. Add your service account email address to the members list, and give it at least \`Viewer\` permission
5. Open the \`Shared Drive\`, and copy the ID from the URL, it's the part after \`/drive/u/0/folders/\` in the URL (e.g: https://drive.google.com/drive/u/0/folders/ \`<drive_id>\` )
6. Paste the ID to \`Shared Drive\` field on the [configuration](#config) section, and set the \`is Team Drive\` to \`true\`
7. For the root folder, you can set it to the folder ID inside the Shared Drive, or use the Shared Drive ID as the root folder ID
8. Update the configuration file, and redeploy the app to apply the changes
9. Done! 🎉

If you don't want to use the configuration section below, you can encrypt your \`Shared Drive\` ID using the \`/api/internal/encrypt?q=<drive_id>\` endpoint, and update the config file directly.`;
