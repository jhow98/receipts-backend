import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745989284602 implements MigrationInterface {
    name = 'InitialSchema1745989284602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recipes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(45) NOT NULL, \`preparation_time_minutes\` int NOT NULL, \`servings\` int NOT NULL, \`preparation_method\` text NOT NULL, \`ingredients\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`categoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`login\` varchar(100) NOT NULL, \`password\` varchar(100) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2d443082eccd5198f95f2a36e2\` (\`login\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_ad4f881e4b9769d16c0ed2bb3f0\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_d4097844785f4a027db682aa671\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_d4097844785f4a027db682aa671\``);
        await queryRunner.query(`ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_ad4f881e4b9769d16c0ed2bb3f0\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d443082eccd5198f95f2a36e2\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`recipes\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
    }

}
