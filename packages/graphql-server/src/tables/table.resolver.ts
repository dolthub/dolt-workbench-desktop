import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { systemTableValues } from "../systemTables/systemTable.enums";
import { RefArgs, TableArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import {
  columnsQuery,
  foreignKeysQuery,
  indexQuery,
  listTablesQuery,
} from "./table.queries";
import { mapTablesRes } from "./utils";

@ArgsType()
class ListTableArgs extends RefArgs {
  @Field({ nullable: true })
  filterSystemTables?: boolean;
}

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => Table)
  async table(@Args() args: TableArgs): Promise<Table> {
    return this.dss.queryMaybeDolt(
      async q => getTableInfo(q, args),
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => TableNames)
  async tableNames(@Args() args: ListTableArgs): Promise<TableNames> {
    return this.dss.queryMaybeDolt(
      async q => getTableNames(q, args),
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => [Table])
  async tables(@Args() args: ListTableArgs): Promise<Table[]> {
    return this.dss.queryMaybeDolt(
      async q => {
        const tableNames = await getTableNames(q, args);
        const tables = await Promise.all(
          tableNames.list.map(async name =>
            getTableInfo(q, { ...args, tableName: name }),
          ),
        );
        return tables;
      },
      args.databaseName,
      args.refName,
    );
  }

  // Utils
  async maybeTable(@Args() args: TableArgs): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}

async function getTableNames(
  query: ParQuery,
  args: ListTableArgs,
): Promise<TableNames> {
  const tables = await query(listTablesQuery);
  const mapped = mapTablesRes(tables);

  if (args.filterSystemTables) return { list: mapped };

  // Add system tables if filter is false
  const systemTables = await getSystemTables(query);
  return { list: [...mapped, ...systemTables] };
}

async function getTableInfo(query: ParQuery, args: TableArgs): Promise<Table> {
  const columns = await query(columnsQuery, [args.tableName]);
  const fkRows = await query(foreignKeysQuery, [args.tableName]);
  const idxRows = await query(indexQuery, [args.tableName]);
  return fromDoltRowRes(
    args.databaseName,
    args.refName,
    args.tableName,
    columns,
    fkRows,
    idxRows,
  );
}

export async function handleTableNotFound(
  q: () => Promise<any | undefined>,
): Promise<any | undefined> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (err.message.includes("table not found")) {
      return undefined;
    }
    throw err;
  }
}

export async function getSystemTables(query: ParQuery): Promise<string[]> {
  const systemTables = await Promise.all(
    systemTableValues.map(async st => {
      const cols = await handleTableNotFound(async () =>
        query(columnsQuery, [st]),
      );
      if (cols) return `${st}`;
      return undefined;
    }),
  );
  return systemTables.filter(st => !!st) as string[];
}
