import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1714620000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categories = [
      'Café da Manhã',
      'Almoço',
      'Jantar',
      'Sobremesa',
      'Lanche Rápido',
      'Vegetariana',
      'Vegana',
      'Fitness',
      'Massas',
      'Carnes',
    ];

    for (const name of categories) {
      const existing = await queryRunner.query(
        `SELECT id FROM categories WHERE name = ? LIMIT 1`,
        [name]
      );

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO categories (name) VALUES (?)`,
          [name]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM categories
      WHERE name IN (
        'Café da Manhã',
        'Almoço',
        'Jantar',
        'Sobremesa',
        'Lanche Rápido',
        'Vegetariana',
        'Vegana',
        'Fitness',
        'Massas',
        'Carnes'
      )
    `);
  }
}
