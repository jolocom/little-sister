import {MigrationInterface, QueryRunner} from "typeorm";

export class init1607009879181 implements MigrationInterface {
    name = 'init1607009879181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cache" ("key" varchar PRIMARY KEY NOT NULL, "value" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "encrypted_wallet" ("id" varchar(100) PRIMARY KEY NOT NULL, "timestamp" integer NOT NULL, "encryptedWallet" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"))`, undefined);
        await queryRunner.query(`CREATE TABLE "verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectId" varchar(100))`, undefined);
        await queryRunner.query(`CREATE TABLE "credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"))`, undefined);
        await queryRunner.query(`CREATE TABLE "event_log" ("id" varchar(100) PRIMARY KEY NOT NULL, "eventStream" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "identityCache" ("key" varchar PRIMARY KEY NOT NULL, "value" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "interaction_tokens" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nonce" varchar NOT NULL, "type" varchar NOT NULL, "issuer" varchar NOT NULL, "timestamp" integer NOT NULL, "original" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "master_keys" ("encryptedEntropy" varchar(100) PRIMARY KEY NOT NULL, "timestamp" integer NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "settings" ("key" varchar PRIMARY KEY NOT NULL, "value" text NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"), CONSTRAINT "FK_751b7e1a0b6996488fa3bf63ca2" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_signatures"("id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId") SELECT "id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId" FROM "signatures"`, undefined);
        await queryRunner.query(`DROP TABLE "signatures"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_signatures" RENAME TO "signatures"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectId" varchar(100), CONSTRAINT "FK_bc0241a547a24735bb29d43a0af" FOREIGN KEY ("subjectId") REFERENCES "encrypted_wallet" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_verifiable_credentials"("@context", "id", "type", "name", "issuer", "issued", "expires", "subjectId") SELECT "@context", "id", "type", "name", "issuer", "issued", "expires", "subjectId" FROM "verifiable_credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "verifiable_credentials"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_verifiable_credentials" RENAME TO "verifiable_credentials"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"), CONSTRAINT "FK_40a4c92d65d3c6cf200c360b1ce" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_credentials"("id", "propertyName", "propertyValue", "verifiableCredentialId") SELECT "id", "propertyName", "propertyValue", "verifiableCredentialId" FROM "credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "credentials"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_credentials" RENAME TO "credentials"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credentials" RENAME TO "temporary_credentials"`, undefined);
        await queryRunner.query(`CREATE TABLE "credentials" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "propertyName" varchar(50) NOT NULL, "propertyValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"))`, undefined);
        await queryRunner.query(`INSERT INTO "credentials"("id", "propertyName", "propertyValue", "verifiableCredentialId") SELECT "id", "propertyName", "propertyValue", "verifiableCredentialId" FROM "temporary_credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_credentials"`, undefined);
        await queryRunner.query(`ALTER TABLE "verifiable_credentials" RENAME TO "temporary_verifiable_credentials"`, undefined);
        await queryRunner.query(`CREATE TABLE "verifiable_credentials" ("@context" text NOT NULL, "id" varchar(50) PRIMARY KEY NOT NULL, "type" text NOT NULL, "name" varchar(20), "issuer" varchar(75) NOT NULL, "issued" datetime NOT NULL, "expires" datetime, "subjectId" varchar(100))`, undefined);
        await queryRunner.query(`INSERT INTO "verifiable_credentials"("@context", "id", "type", "name", "issuer", "issued", "expires", "subjectId") SELECT "@context", "id", "type", "name", "issuer", "issued", "expires", "subjectId" FROM "temporary_verifiable_credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_verifiable_credentials"`, undefined);
        await queryRunner.query(`ALTER TABLE "signatures" RENAME TO "temporary_signatures"`, undefined);
        await queryRunner.query(`CREATE TABLE "signatures" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "created" datetime NOT NULL, "creator" varchar NOT NULL, "nonce" varchar, "signatureValue" varchar NOT NULL, "verifiableCredentialId" varchar(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"))`, undefined);
        await queryRunner.query(`INSERT INTO "signatures"("id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId") SELECT "id", "type", "created", "creator", "nonce", "signatureValue", "verifiableCredentialId" FROM "temporary_signatures"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_signatures"`, undefined);
        await queryRunner.query(`DROP TABLE "settings"`, undefined);
        await queryRunner.query(`DROP TABLE "master_keys"`, undefined);
        await queryRunner.query(`DROP TABLE "interaction_tokens"`, undefined);
        await queryRunner.query(`DROP TABLE "identityCache"`, undefined);
        await queryRunner.query(`DROP TABLE "event_log"`, undefined);
        await queryRunner.query(`DROP TABLE "credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "verifiable_credentials"`, undefined);
        await queryRunner.query(`DROP TABLE "signatures"`, undefined);
        await queryRunner.query(`DROP TABLE "encrypted_wallet"`, undefined);
        await queryRunner.query(`DROP TABLE "cache"`, undefined);
    }

}
