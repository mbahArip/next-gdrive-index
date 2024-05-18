export const new_user = `Prerequisites:

- A basic understanding of Vercel (or similar services)
- Google Cloud Platform account

### Fork or Clone the repository

It's pretty obvious, but you need to fork the repository to your account.
You can [click here](https://github.com/mbahArip/next-gdrive-index/fork) to fork the repository.  
You can choose any repository name, description, and visibility.

But if you want to run it locally, you can clone the repository instead.

### Create a Google Cloud Platform project and enable Google Drive API

We need an access to Google Drive API to get the files from Google Drive.
So you need to create a project in Google Cloud Platform and enable Google Drive API to get your own credentials.

1. Go to [Google Cloud Platform](https://console.cloud.google.com/)
2. Click the \`New Project\` button
3. Enter a project name, and click the \`Create\` button
4. After the project is created, click the \`Enable APIs and Services\` button
5. Search for Google Drive API, and click the \`Enable\` button

### Create a Service Account and get the credentials

After enabling the Google Drive API, we need to create a service account to get the credentials.
The credentials will be used to authenticate the application to access the Google Drive API and get the files.

1. On [APIs & Services](https://console.cloud.google.com/apis/dashboard) page, click the \`Credentials\` menu on the sidebar
2. Click the \`Create Credentials\` button, and choose \`Service account\`
3. Enter your service account name and description, and then click the \`Done\` button
4. You will see the service account you just created on \`Service Account\` table, click the name of the service account to open the details
5. Go to \`Keys\` tab, then click the \`Add Key\` button and choose the \`Create new key\`
6. Pick \`JSON\` as the key type and click the \`Create\` button
7. The JSON file will be downloaded to your computer, and **keep it safe**. We will use it later on the configuration

_**Note:** The JSON file contains sensitive information, don't share it with anyone_

### Create shared folder in Google Drive

Since the service account can't access your Root folder, you need to create a new folder, and share it with the service account.
This folder will be used as the root folder for the application.

> If you're using or the folder you want to share inside Shared Drive, you can skip this step and go to the [Shared Drive Guide](#shared-drive)

1. Go to [Google Drive](https://drive.google.com/)
2. Click the \`New\` button, and choose \`Folder\` to create a new folder, you can name it anything you want
3. Right-click the folder you just created, and choose \`Share\`
4. Enter the email address of the service account you just created (you can find it on the JSON file, or on the service account details page)
5. To allow download files larger than deployment limit, you need to enable \`Link sharing\` and set it to \`Anyone with the link\`
6. Copy the folder ID from the URL, it's the part after \`/folders/\` in the URL (e.g: https://drive.google.com/drive/u/0/folders/ \`<folder_id>\` )

### Configuring the app and Customizing the theme

Now we need to configure the app to use the credentials and folder ID we just created.
You can follow the [App Configuration](#config) and [Customize Theme](#theme) sections to configure the app and customize the theme.

_**Note:** You can skip the theme customization, but you **NEED** to configure the app_

### Deploy the app

On this guide we will use Vercel to deploy the app, but you can use other platforms like Netlify, Heroku, etc.
But don't forget to adjust the \`fileSizeLimit\` on the [configuration](#config) if you use other platforms.

> Before deploying, make sure you have pushed the changes to your repository

1. Go to [Vercel](https://vercel.com/)
2. Click on the \`Add new\` button, and choose \`Project\`
3. Choose the repository you just forked
4. On the \`Environment Variables\` section, copy the whole content from \`.env.local\` you just downloaded from [configuration](#config) section, and paste it on the key fields. It will automatically add all the environment variables needed
5. Click the \`Deploy\` button
6. Wait for the deployment to finish, and open project
7. Go to \`Settings\` tab, and click the \`Functions\` menu, and select your \`Function Region\` to the nearest region to your location for optimal speed
8. Go to \`Deployment\` tab, click the 3 dots on the right side of the latest \`Production\` deployment, and click the \`Redeploy\` button to apply the changes

For other platforms, you can check their own documentation for Next.js deployment guide.

### Done! 🎉

Congratulations! You have successfully deployed the app.`;
