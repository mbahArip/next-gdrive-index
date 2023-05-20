module.exports = {
  // Client ID are safe to expose
  client_id:
    "126409166174-l2unckghm8d5m1gp3deu0uaps5son64f.apps.googleusercontent.com",
  dev_client_id:
    "126409166174-l0f9hdblsrmhkt9jeue9m8o93skfs1sr.apps.googleusercontent.com",

  /**
   * Change this value to match your platform.
   */
  basePath:
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:5000",

  old: {
    files: {
      // How many files to show per page
      itemsPerPage: 25,
      // Max number of files to show in search result
      searchResult: 5,
      // Starting point of the drive
      // Use 'root' to use My Drive as starting point
      // Or use folder id to use a specific folder as starting point
      // TODO: Change when final
      // rootFolder: "root",
      rootFolder: "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j", // Test folder
      // Limit breadcrumb to specific depth
      // 0 = Unlimited
      // 1 = Only show current folder
      // 2 = Show current folder and its parent
      // 3 = Show current folder and its parent and grandparent
      // and so on.
      // Warning: More parent = More API calls = Slower loading time
      // There are no workaround for this yet, since Google Drive API v3 return only 1 parent
      // Default: 2
      breadcrumbDepth: 2,
    },

    // Cache control header
    // https://web.dev/uses-long-cache-ttl/
    // Default: 1 minute
    cache: "s-maxage=60, stale-while-revalidate",

    // Max response body size
    // If you're using Vercel, the max response size is 4.5MB
    // https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
    // If you're using another platform that has different limit,
    // change this value to match your platform.
    maxResponseSize: 4 * 1024 * 1024,
  },

  files: {
    field:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, iconLink, trashed",
    orderBy: "folder, name asc, modifiedTime desc",
    /**
     * Special file names that will be used for certain purposes
     * These files will be ignored when searching for files
     * and will be hidden from the file list
     */
    specialFile: {
      password: ".password",
      readme: ".readme.md",
      /**
       * Banner are used for generating custom open graph image for folder
       * By default, all folder will use the og.png inside public folder
       */
      banner: ".banner",
    },
    itemsPerPage: 50,
    searchResult: 10,
    /**
     * Starting point of the drive
     * Use 'root' to use My Drive as starting point
     * Or use folder id to use a specific folder as starting point
     */
    rootFolder: "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j",
    /**
     * Limit breadcrumb to specific depth
     * 0 = Unlimited
     * 1 = Only show current file
     * 2 = Show current file and its parent
     * 3 = Show current file, its parent and grandparent
     * and so on.
     * Default: 2
     */
    breadcrumbDepth: 2,
    download: {
      /**
       * Allow user to download protected file without password
       * If this set to false, the download link will have temporary token to download the files
       * If this set to true, the download link will be permanent
       * Default: false
       */
      allowProtectedFile: false,
      temporaryTokenDuration: 60 * 60, // 1 hour
      /**
       * If you're using Vercel, the max response size is 4.5MB
       * https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
       * If you're using another platform that has different limit,
       * change this value to match your platform.
       */
      maxFileSize: 4 * 1024 * 1024,
    },
  },

  /**
   * https://web.dev/uses-long-cache-ttl/
   */
  cache: "s-maxage=60, stale-while-revalidate",
};
