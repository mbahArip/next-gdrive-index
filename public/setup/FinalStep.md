To finishing the setup, you need to do the following steps:

## API Config
The API Config file are located at `src/config/api.ts`. You need to fill in the following information:
```js
module.exports = {
    client_id: "lorem",
    client_secret: "ipsum",
    refresh_token: "dolor",
}
```

## Environment Config
The environment variables are differ for each hosting service. If you are using Vercel, you can add the environment variables on the project settings page.
```dotenv
ENCRYPTION_KEY="Encryption"
```

**NOTE:** Make sure to redeploy the site after adding the environment variables.

## Customizing the Site
The site can be customized by editing the `src/config/site.ts` file. You can change the site title, description, and other information.  
All the explanation also included in the file.


And that's it, you're done with the setup. You can now start using the site.