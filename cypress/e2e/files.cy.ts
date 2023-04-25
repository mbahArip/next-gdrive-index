const hash = require("../../src/utils/hashHelper");

const ids: { [key: string]: string } = {
  file: "1K_KyC8B54En7UaD3_o7zubxwG4jtXTVK",
  folder: "12fKI0g0Uvkubk1sSHCd_SDErLyc9TlWe",
  protectedFolder: "1p6znx1BKPsqFnyOPw49uhoc8FNglfYnD",
  protectedFile: "1NK-J1QIf0vuGnDIEHXBG2-9jXP6sKCuN",
  protectedSubFolder: "1_N87OSlhPYfC3L1fGfE546LoJnCK8zBX",
  protectedSubFile: "1CSKTtgXunrSHYRRp8FyMXYpNP6xK1iju",
  protectedInsideProtected: "1VMU0sQOkuI06icRRJFof-6V-NLyBWlp5",
  protectedFileInsideProtected: "1wXsNhp8JxOc8iBRyb98PkR1G_MijE2e0",
};

describe("Files API", () => {
  it("Get root files", () => {
    cy.request({
      method: "GET",
      url: "/api/files",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(false);
      expect(response.body.passwordValidated).to.satisfy(
        (key: any) => key === true || key === undefined,
      );
      expect(response.body.protectedId).to.eq(undefined);
      expect(response.body.folders).to.have.length.at.least(0);
      expect(response.body.files).to.have.length.at.least(0);
      expect(response.body.readmeExists).to.be.a("boolean");
      expect(response.body.nextPageToken).to.satisfy(
        (key: any) => typeof key === "string" || key === undefined,
      );
    });
  });

  it("Get file", () => {
    cy.request({
      method: "GET",
      url: `/api/files/${ids.file}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(false);
      expect(response.body.passwordValidated).to.satisfy(
        (key: any) => key === true || key === undefined,
      );
      expect(response.body.protectedId).to.eq(undefined);
      expect(response.body.parents).to.have.length.at.least(0);
      expect(response.body.file).to.have.property("id");
    });
  });

  it("Get folder", () => {
    cy.request({
      method: "GET",
      url: `/api/files/${ids.folder}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(false);
      expect(response.body.passwordValidated).to.satisfy(
        (key: any) => key === true || key === undefined,
      );
      expect(response.body.protectedId).to.eq(undefined);
      expect(response.body.parents).to.have.length.at.least(0);
      expect(response.body.folders).to.have.length.at.least(0);
      expect(response.body.files).to.have.length.at.least(0);
      expect(response.body.readmeExists).to.be.a("boolean");
      expect(response.body.nextPageToken).to.satisfy(
        (key: any) => typeof key === "string" || key === undefined,
      );
    });
  });

  it("Get protected folder - without password", () => {
    cy.request({
      method: "GET",
      url: `/api/files/${ids.protectedFolder}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(true);
      expect(response.body.passwordValidated).to.eq(false);
      expect(response.body.protectedId).to.be.a("string");
    });
  });
  it("Get protected folder - wrong password", () => {
    const hashPassword = hash.hashToken("wrong password");
    cy.request({
      method: "GET",
      url: `/api/files/${ids.protectedFolder}`,
      headers: {
        Authorization: `Bearer ${hashPassword}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(true);
      expect(response.body.passwordValidated).to.eq(false);
      expect(response.body.protectedId).to.be.a("string");
    });
  });
  it("Get protected folder - with password", () => {
    const hashPassword = hash.hashToken("loremipsum");
    cy.request({
      method: "GET",
      url: `/api/files/${ids.protectedFolder}`,
      headers: {
        Authorization: `Bearer ${hashPassword}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.passwordRequired).to.eq(true);
      expect(response.body.passwordValidated).to.eq(true);
      expect(response.body.protectedId).to.be.a("string");
      expect(response.body.parents).to.have.length.at.least(0);
      expect(response.body.folders).to.have.length.at.least(0);
      expect(response.body.files).to.have.length.at.least(0);
      expect(response.body.readmeExists).to.be.a("boolean");
      expect(response.body.nextPageToken).to.satisfy(
        (key: any) => typeof key === "string" || key === undefined,
      );
    });
  });
});
