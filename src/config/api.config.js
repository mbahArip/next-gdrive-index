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
    "b6ef7852ce97441fb6a43e1701b788f1:d96b5bc1624455536b0f5934a1d39e223d11bacfb2edcbfe69be568c7230bec69d741bc4c789d5c435bf575ab70dfd9a4c350c70562b73ec4f6e4903f0aef825fdd2dd2b1b8c42cb78f0fed1d74be7785e9a48082aac76b23cb3dc419ce11e9a8c61a586423913a1b7c2d996a5306816",

  files: {
    // How many files to show per page
    itemsPerPage: 500,
    // Max number of files to show in search result
    searchResult: 10,
    // Starting point of the drive
    // Use 'root' to use My Drive as starting point
    // Or use folder id to use a specific folder as starting point
    // TODO: Change when final
    rootFolder: "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j", // Test folder
  },

  // Cache control header
  // https://web.dev/uses-long-cache-ttl/
  cache: "s-maxage=60, stale-while-revalidate",

  // Max response body size
  // If you're using Vercel, the max response size is 4.5MB
  // https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
  // If you're using another platform that has different limit,
  // change this value to match your platform.
  maxResponseSize: 4 * 1024 * 1024,
};
