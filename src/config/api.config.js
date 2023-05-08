module.exports = {
  // Client ID are safe to expose
  client_id:
    "126409166174-l2unckghm8d5m1gp3deu0uaps5son64f.apps.googleusercontent.com",
  // Client secret and refresh token are encrypted
  // Using encryption key
  // https://drive.mbaharip.com/gudora-setup
  client_secret:
    "54f0505d11a8fe04d22ec642cdde4728:a6f911c70b0305a51160a2133a9bd2ada3c120567857002311f17bf29cc69e07d7f1a9ca20fd119d684191aee6e3866a",
  refresh_token:
    "209b4d2ff44bf877ce0636ddc81cdc9a:4a40e172ba5d6c1ee8daf50389841bd2c9d1153163196da0dab63c07b6f305bedafaa209a9e6adbb8d2377c74ba98cf818b6e73b8f57098686ed0b89bec93b0186047ccaab8804310a2ab4e46069d1cac8c322f0f1e206808ac62c18639610be07559eebad904905ba185cae8ba9fbe9",

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
};
