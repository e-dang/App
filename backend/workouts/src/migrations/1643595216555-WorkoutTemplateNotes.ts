import {MigrationInterface, QueryRunner} from "typeorm";

export class WorkoutTemplateNotes1643595216555 implements MigrationInterface {
  name = "WorkoutTemplateNotes1643595216555";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workoutTemplates" ADD "notes" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workoutTemplates" DROP COLUMN "notes"`);
  }
}
