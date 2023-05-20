import driveClient from "utils/driveClient";

async function getRootFiles() {}
async function getPassword() {}
async function getReadme() {}

async function RootPage() {
  const start = new Date().getTime();
  const [files, password, readme] = await Promise.all([
    getRootFiles(),
    getPassword(),
    getReadme(),
  ]);
  const end = new Date().getTime();
  return (
    <div>
      <h1>{end - start}</h1>
    </div>
  );
}

export default RootPage;
