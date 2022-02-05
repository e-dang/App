import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1643384912767 implements MigrationInterface {
  name = "Initial1643384912767";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "exerciseTypes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "UQ_e46d877011a2a7b964bc0ef0931" UNIQUE ("name", "ownerId"), CONSTRAINT "PK_047f01b1fe63d1b80ef5d55a584" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_cad92cc95ffaa7bdfa6790724e" ON "exerciseTypes" ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_1ce5a379b6be124f92eebd9390" ON "exerciseTypes" ("ownerId") `);
    await queryRunner.query(`CREATE TYPE "public"."exerciseTemplates_unit_enum" AS ENUM('lb', 'kg')`);
    await queryRunner.query(
      `CREATE TABLE "exerciseTemplates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "index" smallint NOT NULL, "targetReps" smallint NOT NULL, "targetSets" smallint NOT NULL, "targetWeight" smallint NOT NULL, "unit" "public"."exerciseTemplates_unit_enum" NOT NULL, "exerciseGroupId" uuid NOT NULL, "typeId" uuid NOT NULL, CONSTRAINT "UQ_0ada99804328b8f4d3a555b94e8" UNIQUE ("index", "exerciseGroupId") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_377004a1c84f1c5cf8cbbbfe299" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2efa790346c69987fac4f35655" ON "exerciseTemplates" ("exerciseGroupId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workoutTemplates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "UQ_d3c90b1a2f54d4ebbcb37b0c610" UNIQUE ("name", "ownerId"), CONSTRAINT "PK_ec1ba142031d76c5f464974f8c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_8255e807889c41ae61c9a608dd" ON "workoutTemplates" ("ownerId") `);
    await queryRunner.query(
      `CREATE TABLE "exerciseGroupTemplates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "index" smallint NOT NULL, "workoutId" uuid NOT NULL, CONSTRAINT "UQ_25a0c4327831a4cb5d7b46fe274" UNIQUE ("index", "workoutId") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_e3182400e737cb19cff01e1d20b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_9c2d105a8a2ecff9ad015dbd9d" ON "exerciseGroupTemplates" ("workoutId") `);
    await queryRunner.query(
      `ALTER TABLE "exerciseTypes" ADD CONSTRAINT "FK_1ce5a379b6be124f92eebd9390c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exerciseTemplates" ADD CONSTRAINT "FK_2efa790346c69987fac4f35655c" FOREIGN KEY ("exerciseGroupId") REFERENCES "exerciseGroupTemplates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exerciseTemplates" ADD CONSTRAINT "FK_dca9c4ab7904e969e60325db7e8" FOREIGN KEY ("typeId") REFERENCES "exerciseTypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workoutTemplates" ADD CONSTRAINT "FK_8255e807889c41ae61c9a608dda" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exerciseGroupTemplates" ADD CONSTRAINT "FK_9c2d105a8a2ecff9ad015dbd9de" FOREIGN KEY ("workoutId") REFERENCES "workoutTemplates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "exerciseGroupTemplates" DROP CONSTRAINT "FK_9c2d105a8a2ecff9ad015dbd9de"`);
    await queryRunner.query(`ALTER TABLE "workoutTemplates" DROP CONSTRAINT "FK_8255e807889c41ae61c9a608dda"`);
    await queryRunner.query(`ALTER TABLE "exerciseTemplates" DROP CONSTRAINT "FK_dca9c4ab7904e969e60325db7e8"`);
    await queryRunner.query(`ALTER TABLE "exerciseTemplates" DROP CONSTRAINT "FK_2efa790346c69987fac4f35655c"`);
    await queryRunner.query(`ALTER TABLE "exerciseTypes" DROP CONSTRAINT "FK_1ce5a379b6be124f92eebd9390c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9c2d105a8a2ecff9ad015dbd9d"`);
    await queryRunner.query(`DROP TABLE "exerciseGroupTemplates"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8255e807889c41ae61c9a608dd"`);
    await queryRunner.query(`DROP TABLE "workoutTemplates"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2efa790346c69987fac4f35655"`);
    await queryRunner.query(`DROP TABLE "exerciseTemplates"`);
    await queryRunner.query(`DROP TYPE "public"."exerciseTemplates_unit_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1ce5a379b6be124f92eebd9390"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cad92cc95ffaa7bdfa6790724e"`);
    await queryRunner.query(`DROP TABLE "exerciseTypes"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
