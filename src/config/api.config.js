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
    "44078de6e3407c6dc6a41c65a5f58687:da00ab1cff6daea563ed1991da94fb4ac232dd09eb4a65286b2400cb3e36b5ba28a553b5e3a08bc05029839b7f6f83779e1feaecbe56c9aabce9dd245b2f40982818ac216be21c1409919c0c7a2f9be9915825e1d4708089b8ab59599d327704910f71e081851748b98f6d6e82ab8c30",

  files: {
    // How many files to show per page
    itemsPerPage: 50,
    // Max number of files to show in search result
    searchResult: 10,
    // Starting point of the drive
    // Use 'root' to use My Drive as starting point
    // Or use folder id to use a specific folder as starting point
    // TODO: Change when final
    // rootFolder: "root",
    rootFolder: "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j", // Test folder
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
