import { MigrationInterface, QueryRunner } from 'typeorm/browser'

// Template migration for typeorm, don't include this directly into the typeorm config.
// Create a copy and add that to the config.
export class Template implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {}

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
