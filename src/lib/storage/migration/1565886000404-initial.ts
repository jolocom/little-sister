import { MigrationInterface, QueryRunner } from 'typeorm/browser'

export class Initial1565886000404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const dbState = await queryRunner.query(
      `SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';`,
    )
    if (dbState.length > 2) {
      // default tables are migration and android_metadata
      // if there are more than these tables we assume that the Database is already initialized
      return
    }
    await queryRunner.query(
      `CREATE TABLE "cache" ("key" varchar PRIMARY KEY NOT NULL, "value" text NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "personas" ("controllingKeyPath" varchar NOT NULL, "did" varchar(75) PRIMARY KEY NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectDid" varchar(75))`,
    )
    await queryRunner.query(
      `CREATE TABLE "credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" varchar PRIMARY KEY NOT NULL, "value" text NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "master_keys" ("encryptedEntropy" varchar(100) PRIMARY KEY NOT NULL, "timestamp" integer NOT NULL)`,
    )
    await queryRunner.query(
      `CREATE TABLE "temporary_signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"), CONSTRAINT "FK_751b7e1a0b6996488fa3bf63ca2" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "temporary_signatures"("id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId") SELECT "id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId" FROM "signatures"`,
    )
    await queryRunner.query(`DROP TABLE "signatures"`)
    await queryRunner.query(
      `ALTER TABLE "temporary_signatures" RENAME TO "signatures"`,
    )
    await queryRunner.query(
      `CREATE TABLE "temporary_verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectDid" varchar(75), CONSTRAINT "FK_3c8d25af5cf8d077b3b3d372ce8" FOREIGN KEY ("subjectDid") REFERENCES "personas" ("did") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "temporary_verifiable_credentials"("@context", "id", "type", "name", "issuer", "issued", "expires", "subjectDid") SELECT "@context", "id", "type", "name", "issuer", "issued", "expires", "subjectDid" FROM "verifiable_credentials"`,
    )
    await queryRunner.query(`DROP TABLE "verifiable_credentials"`)
    await queryRunner.query(
      `ALTER TABLE "temporary_verifiable_credentials" RENAME TO "verifiable_credentials"`,
    )
    await queryRunner.query(
      `CREATE TABLE "temporary_credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"), CONSTRAINT "FK_40a4c92d65d3c6cf200c360b1ce" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "temporary_credentials"("id", "propertyName", "propertyValue", "verifiableCredentialId") SELECT "id", "propertyName", "propertyValue", "verifiableCredentialId" FROM "credentials"`,
    )
    await queryRunner.query(`DROP TABLE "credentials"`)
    await queryRunner.query(
      `ALTER TABLE "temporary_credentials" RENAME TO "credentials"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "credentials" RENAME TO "temporary_credentials"`,
    )
    await queryRunner.query(
      `CREATE TABLE "credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"))`,
    )
    await queryRunner.query(
      `INSERT INTO "credentials"("id", "propertyName", "propertyValue", "verifiableCredentialId") SELECT "id", "propertyName", "propertyValue", "verifiableCredentialId" FROM "temporary_credentials"`,
    )
    await queryRunner.query(`DROP TABLE "temporary_credentials"`)
    await queryRunner.query(
      `ALTER TABLE "verifiable_credentials" RENAME TO "temporary_verifiable_credentials"`,
    )
    await queryRunner.query(
      `CREATE TABLE "verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectDid" varchar(75))`,
    )
    await queryRunner.query(
      `INSERT INTO "verifiable_credentials"("@context", "id", "type", "name", "issuer", "issued", "expires", "subjectDid") SELECT "@context", "id", "type", "name", "issuer", "issued", "expires", "subjectDid" FROM "temporary_verifiable_credentials"`,
    )
    await queryRunner.query(`DROP TABLE "temporary_verifiable_credentials"`)
    await queryRunner.query(
      `ALTER TABLE "signatures" RENAME TO "temporary_signatures"`,
    )
    await queryRunner.query(
      `CREATE TABLE "signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"))`,
    )
    await queryRunner.query(
      `INSERT INTO "signatures"("id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId") SELECT "id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId" FROM "temporary_signatures"`,
    )
    await queryRunner.query(`DROP TABLE "temporary_signatures"`)
    await queryRunner.query(`DROP TABLE "master_keys"`)
    await queryRunner.query(`DROP TABLE "settings"`)
    await queryRunner.query(`DROP TABLE "credentials"`)
    await queryRunner.query(`DROP TABLE "verifiable_credentials"`)
    await queryRunner.query(`DROP TABLE "signatures"`)
    await queryRunner.query(`DROP TABLE "personas"`)
    await queryRunner.query(`DROP TABLE "cache"`)
  }
}
