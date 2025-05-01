import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsToSnakeCase1746041785357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove as FKs antigas (baseado na migration inicial)
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_ad4f881e4b9769d16c0ed2bb3f0\``
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_d4097844785f4a027db682aa671\``
    );

    // Renomeia as colunas para snake_case
    await queryRunner.query(
      `ALTER TABLE \`recipes\` CHANGE \`userId\` \`user_id\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` CHANGE \`categoryId\` \`category_id\` int NULL`
    );

    // Cria novamente as FKs com os nomes novos
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_recipes_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_recipes_category_id\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverte as FKs
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_recipes_category_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_recipes_user_id\``
    );

    // Volta os nomes antigos
    await queryRunner.query(
      `ALTER TABLE \`recipes\` CHANGE \`category_id\` \`categoryId\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` CHANGE \`user_id\` \`userId\` int NULL`
    );

    // Restaura as FKs antigas
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_d4097844785f4a027db682aa671\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_ad4f881e4b9769d16c0ed2bb3f0\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
