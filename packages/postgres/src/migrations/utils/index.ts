import {
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKey,
} from 'typeorm';

export async function DatabaseCreateTable(
  queryRunner: QueryRunner,
  tableName: string,
  tableColumns: TableColumnOptions[],
) {
  await queryRunner.createTable(
    new Table({
      name: tableName,
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'uuid',
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        ...tableColumns,
        {
          name: 'created_at',
          type: 'timestamptz',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamptz',
          default: 'now()',
        },
        {
          name: 'deleted_at',
          type: 'timestamptz',
          isNullable: true,
          default: null,
        },
      ],
    }),
    true,
  );
}

export async function DatabaseCreateForeignKey(
  queryRunner: QueryRunner,
  tableName: string,
  referencedTableName: string,
  columnName?: string,
) {
  await queryRunner.createForeignKey(
    tableName,
    new TableForeignKey({
      columnNames: [columnName || `${referencedTableName}_id`],
      referencedTableName: referencedTableName,
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }),
  );
}

export async function DatabaseDropForeignKey(
  queryRunner: QueryRunner,
  tableName: string,
  referencedTableName: string,
  columnName?: string,
) {
  // Retrieve the table schema
  const table = await queryRunner.getTable(tableName);
  if (!table) throw new Error(`Table ${tableName} not found`);

  // Determine the column name for the foreign key
  const fkColumnName = columnName || `${referencedTableName}_id`;

  // Find the foreign key in the table
  const foreignKey = table.foreignKeys.find(
    (fk) => fk.columnNames.indexOf(fkColumnName) !== -1,
  );
  if (!foreignKey)
    throw new Error(`Foreign key on column ${fkColumnName} not found`);

  // Drop the foreign key
  await queryRunner.dropForeignKey(tableName, foreignKey);
}
